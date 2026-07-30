import { type TypeExtends } from '../condition/index.mjs';
import { type Int8 } from '../constants/index.mjs';
import { type BoolAnd, type RelaxedExclude } from '../others/index.mjs';
import { type Abs } from './abs.mjs';
import {
  type Index,
  type IndexInclusive,
  type NegativeIndex,
} from './index-type.mjs';
import { type UintRange } from './uint-range.mjs';

/**
 * Creates a union of integer literals starting from `Start` (inclusive) up to
 * `End` (exclusive). Unlike {@link UintRange}, the bounds may be negative.
 *
 * The bounds are limited to the signed 8-bit range: `Start` must be an `Int8`
 * (`-128` to `127`) and `End` must be an `Int8` or `128`. Ranges where
 * `Start >= End` (including a positive `Start` with a negative `End`) resolve
 * to `never`.
 *
 * @template Start - The starting integer literal (inclusive).
 * @template End - The ending integer literal (exclusive).
 * @returns A union type `Start | Start + 1 | ... | End - 1`.
 * @example
 * type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
 * type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
 * type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
 * type R4 = IntRange<3, -3>; // never
 * type R5 = IntRange<5, 5>; // never
 */
export type IntRange<Start extends Int8, End extends Int8 | 128> =
  BoolAnd<
    TypeExtends<Start, PositiveRange>,
    TypeExtends<End, PositiveRange>
  > extends true
    ? UintRange<Start, End>
    : BoolAnd<
          TypeExtends<Start, NegativeRange>,
          TypeExtends<End, PositiveRange>
        > extends true
      ? NegativeIndex<Abs<Start>> | Index<End>
      : BoolAnd<
            TypeExtends<Start, PositiveRange>,
            TypeExtends<End, NegativeRange>
          > extends true
        ? never
        : BoolAnd<
              TypeExtends<Start, NegativeRange>,
              TypeExtends<End, NegativeRange>
            > extends true
          ? RelaxedExclude<NegativeIndex<Abs<Start>>, NegativeIndex<Abs<End>>>
          : never;

/** @internal The negative half of the bounds accepted by {@link IntRange}. */
type NegativeRange = NegativeIndex<128>;

/** @internal The non-negative half of the bounds accepted by {@link IntRange}. */
type PositiveRange = IndexInclusive<128>;
