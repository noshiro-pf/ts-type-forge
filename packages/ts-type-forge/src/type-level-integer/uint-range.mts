import { type Uint10 } from '../constants/index.mjs';
import { type RelaxedExclude } from '../others/index.mjs';
import { type Index, type IndexInclusive } from './index-type.mjs';

/**
 * Creates a union of non-negative integer literals starting from `Start` (inclusive) up to `End` (exclusive).
 *
 * The bounds are limited to the unsigned 10-bit range: `Start` must be a
 * `Uint10` (`0` to `1023`) and `End` must be a `Uint10` or `1024`, so that a
 * bound the union cannot represent fails with a readable constraint error
 * instead of resolving to `never`. Ranges where `Start >= End` resolve to
 * `never`.
 *
 * @template Start - The starting integer literal (inclusive).
 * @template End - The ending integer literal (exclusive).
 * @returns A union type `Start | Start + 1 | ... | End - 1`.
 * @example
 * type R1 = UintRange<3, 7>; // 3 | 4 | 5 | 6
 * type R2 = UintRange<0, 4>; // 0 | 1 | 2 | 3
 * type R3 = UintRange<5, 5>; // never
 */
export type UintRange<
  Start extends Uint10,
  End extends Uint10 | 1024,
> = RelaxedExclude<Index<End>, Index<Start>>;

/**
 * Creates a union of non-negative integer literals starting from `MinValue` (inclusive) up to `MaxValue` (inclusive).
 *
 * Both bounds are limited to the unsigned 10-bit range (`Uint10`, `0` to
 * `1023`); an inclusive upper bound never needs the extra `1024` that
 * {@link UintRange}'s exclusive `End` accepts. Ranges where
 * `MinValue > MaxValue` resolve to `never`.
 *
 * For a `0`-based range beyond that cap — such as the `0 | ... | 2048` union
 * behind `SupportedLength` — use {@link IndexInclusive} directly:
 * `UintRangeInclusive<0, N>` and `IndexInclusive<N>` are the same type.
 *
 * @template MinValue - The starting integer literal (inclusive).
 * @template MaxValue - The ending integer literal (inclusive).
 * @returns A union type `MinValue | MinValue + 1 | ... | MaxValue`.
 * @example
 * type RI1 = UintRangeInclusive<3, 7>; // 3 | 4 | 5 | 6 | 7
 * type RI2 = UintRangeInclusive<0, 4>; // 0 | 1 | 2 | 3 | 4
 * type RI3 = UintRangeInclusive<5, 5>; // 5
 */
export type UintRangeInclusive<
  MinValue extends Uint10,
  MaxValue extends Uint10,
> = RelaxedExclude<IndexInclusive<MaxValue>, Index<MinValue>>;
