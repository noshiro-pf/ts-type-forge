---
'ts-type-forge': patch
---

**Fixed: a union length or index argument produced a result no call can
return.** `Tuple.SetAt`, `Tuple.Take`, `Tuple.TakeLast`, `Tuple.Skip`,
`Tuple.SkipLast` and `Tuple.Partition` — and everything layered on them,
`List.*` and `ConstrainedList.*` — each assumed their numeric argument named
exactly one position or length. A union names several, of which a call picks
one, and the old answers described neither outcome:

```ts
type A = List.SetAt<0 | 2, 'x', readonly [1, 2, 3]>;
// before: readonly ['x', 2, 'x'] — satisfied by neither ['x', 2, 3] nor [1, 2, 'x']
// after:  readonly [1 | 'x', 2, 3 | 'x']

type B = List.Take<1 | 2, readonly [1, 2, 3]>;
// before: readonly [1] — the equally possible [1, 2] does not satisfy it
// after:  readonly [1] | readonly [1, 2]
```

This was reachable from ordinary code: indexing a tuple by anything other than
a literal gives exactly such a union.

`number` was affected the same way, and worse, because it marks _every_
position or length as a candidate: `SetAt<number, 'x', [1, 2, 3]>` replaced all
three positions, and `Take<number, T>` matched at length zero and answered
`readonly []`.

**The two families are fixed differently, on purpose.**

`SetAt` **widens** each candidate position to `T[I] | V` instead of setting it
to `V`. Its result is one tuple of a fixed length whichever index is chosen, so
widening in place loses nothing that matters — indexed access into
`readonly [1 | 'x', 2, 3 | 'x']` answers exactly what the distributed
`readonly ['x', 2, 3] | readonly [1, 2, 'x']` would — and it keeps the result a
single tuple. That matters because an index union is the common case here;
distributing would turn every such call into one copy of the whole tuple per
index.

The counting members **distribute**, so a union answers with the union of the
per-length results. There is no single tuple to widen into when the candidates
differ in length. For `number`, which pins no length at all, they fall back to
an unsized `readonly Elm[]` (and `Partition` to
`readonly (readonly Elm[])[]`), which admits every prefix or suffix the call
might return.

A single numeric literal — by far the common case — keeps exactly the result it
had before, in every one of these types.

**`ConstrainedList`'s counting members now distribute over `N` once**, at the
top, instead of letting the bound arithmetic and the structural rebuild each
distribute independently. That produced the cross product of the two:

```ts
type C = ConstrainedList.Take<1 | 2, MinLengthArray<3, number>>;
// before: FixedLengthArray<1, number>
//       | BoundedLengthArray<2, 1, number>  <- min above max, uninhabited
//       | BoundedLengthArray<1, 2, number>
//       | FixedLengthArray<2, number>
// after:  FixedLengthArray<1, number> | FixedLengthArray<2, number>
```

The stray members were uninhabited rather than wrong, so that union was sound
already — it collapses to `BoundedLengthArray<1, 2, number>` — but it was noise
that grew as the square of the union.

`MakeTuple` needed no change: it walks the decimal digits of `` `${N}` ``, and
that walk already distributes over a union on its own.

Cost: **+9.5k instantiations, about 0.6%** (1,683,504 against a 1,673,973
baseline), new tests included.
