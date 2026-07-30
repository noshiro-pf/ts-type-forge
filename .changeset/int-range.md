---
'ts-type-forge': minor
---

Add **`IntRange<Start, End>`** and **`IntRangeInclusive<MinValue, MaxValue>`**
to `type-level-integer/`, the signed counterparts of `UintRange` and
`UintRangeInclusive`: unions of integer literals that also accept negative
bounds.

```ts
type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
type R4 = IntRange<3, -3>; // never

type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
type RI4 = IntRangeInclusive<3, -3>; // never
```

The bounds are limited to the signed 8-bit range — `IntRange` takes
`Start extends Int8` and `End extends Int8 | 128` (its upper bound is
exclusive), `IntRangeInclusive` takes `Int8` for both — and empty ranges resolve
to `never`.

`IntRange` is ported from `ts-fortress`, which now re-exports it from here
instead of declaring its own copy.
