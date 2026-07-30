---
'ts-type-forge': minor
---

Add **`IntRange<Start, End>`** to `type-level-integer/`, the signed counterpart
of `UintRange`: a union of integer literals from `Start` (inclusive) to `End`
(exclusive) that also accepts negative bounds.

```ts
type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
type R4 = IntRange<3, -3>; // never
```

The bounds are limited to the signed 8-bit range (`Start extends Int8`,
`End extends Int8 | 128`), and ranges where `Start >= End` resolve to `never`.

The type is ported from `ts-fortress`, which now re-exports it from here
instead of declaring its own copy.
