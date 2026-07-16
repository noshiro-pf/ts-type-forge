import { type ArrayAtLeastLen } from '../../tuple-and-list/index.mjs';
import { type UintRangeInclusive } from '../../type-level-integer/index.mjs';
import { type TSTypeForgeInternals_BrandEncapsulated } from '../_internals.mjs';

/**
 * Branded readonly array type for arrays with at most `MaxLength` elements.
 *
 * Unlike the structural tuple-based `ArrayAtMostLen`, the length
 * constraint is encoded only in the brand, so the element type `Elm` never
 * gets multiplied into tuple positions or tuple unions. This keeps
 * type-checking cost (instantiation count / memory) independent of the size of
 * `Elm` and nearly independent of `MaxLength`, and also supports large bounds
 * (e.g. `1000`) that make the tuple-based family hit the recursion limit.
 * Prefer this type when `Elm` is a large type or the bound is large.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M <= N`, then `MaxLengthArray<M, Elm>` is
 * assignable to `MaxLengthArray<N, Elm>` (an array of at most `M` elements is
 * also an array of at most `N` elements). This is achieved by branding with
 * the union of allowed lengths (`0 | 1 | ... | MaxLength`), which shrinks as
 * the constraint gets stricter. The result is also covariant in `Elm`.
 *
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const isMaxLengthArray = <N extends number, E>(
 *   xs: readonly E[],
 *   maxLength: N,
 * ): xs is MaxLengthArray<N, E> => xs.length <= maxLength;
 *
 * const tags = ['a', 'b', 'c'] as unknown as MaxLengthArray<8, string>;
 *
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
 * const widened: readonly string[] = tags; // OK
 * // const strict: MaxLengthArray<2, string> = tags; // Error! (8 > 2)
 * ```
 */
export type MaxLengthArray<
  MaxLength extends number,
  Elm = unknown,
> = readonly Elm[] &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MaxLength: UintRangeInclusive<0, MaxLength>;
    }>
  >;

/**
 * Branded readonly array type for arrays with at least `MinLength` elements.
 *
 * Unlike the structural tuple-based {@link ArrayAtLeastLen}, the length
 * constraint is encoded only in the brand, so the element type `Elm` never
 * appears in tuple positions. This keeps type-checking cost independent of the
 * size of `Elm` (the brand internally uses a tuple of the literal `0`, whose
 * cost does not depend on `Elm`). Prefer this type when `Elm` is a large type
 * or the bound is large.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M >= N`, then `MinLengthArray<M, Elm>` is
 * assignable to `MinLengthArray<N, Elm>` (an array of at least `M` elements is
 * also an array of at least `N` elements). This is achieved by branding with a
 * readonly tuple type that requires at least `MinLength` elements, which
 * becomes a narrower type as the constraint gets stricter. The result is also
 * covariant in `Elm`.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const isMinLengthArray = <N extends number, E>(
 *   xs: readonly E[],
 *   minLength: N,
 * ): xs is MinLengthArray<N, E> => xs.length >= minLength;
 *
 * const history = [0, 1, 2, 3] as unknown as MinLengthArray<3, number>;
 *
 * const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
 * // const longer: MinLengthArray<5, number> = history; // Error! (3 < 5)
 * ```
 */
export type MinLengthArray<
  MinLength extends number,
  Elm = unknown,
> = readonly Elm[] &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MinLength: ArrayAtLeastLen<MinLength, 0>;
    }>
  >;

/**
 * Branded readonly array type for arrays whose length is between `MinLength`
 * and `MaxLength` elements (both inclusive).
 * Defined as the intersection of {@link MinLengthArray} and
 * {@link MaxLengthArray}, so both bounds can be weakened independently:
 * `BoundedLengthArray<M1, M2, Elm>` is assignable to
 * `BoundedLengthArray<N1, N2, Elm>` if `M1 >= N1` and `M2 <= N2`.
 *
 * This is the brand-based, lightweight counterpart of the structural
 * tuple-based `ArrayBoundedLen`; see {@link MaxLengthArray} for why it
 * is much cheaper to type-check when the element type is large.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const selection = [1, 2, 3] as unknown as BoundedLengthArray<1, 5, number>;
 *
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK ([1, 5] ⊆ [0, 100])
 * const atLeast1: MinLengthArray<1, number> = selection; // OK
 * const atMost5: MaxLengthArray<5, number> = selection; // OK
 * // const strict: BoundedLengthArray<2, 5, number> = selection; // Error! (1 < 2)
 * ```
 */
export type BoundedLengthArray<
  MinLength extends number,
  MaxLength extends number,
  Elm = unknown,
> = MaxLengthArray<MaxLength, Elm> & MinLengthArray<MinLength, Elm>;

/**
 * Branded readonly array type for arrays with exactly `Length` elements.
 * Alias for `BoundedLengthArray<Length, Length, Elm>`.
 *
 * This is the brand-based, lightweight counterpart of the structural
 * tuple-based `ArrayOfLength`. Unlike `ArrayOfLength`, the result is a
 * branded `readonly Elm[]` rather than a tuple, so positional element types
 * and a literal `length` are not available — in exchange, type-checking cost
 * does not depend on the size of `Elm`. Prefer this type when `Elm` is a large
 * type or the length is large.
 *
 * @template Length - The exact number of elements. Must be a non-negative
 *   integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const rgb = [255, 128, 0] as unknown as FixedLengthArray<3, number>;
 *
 * const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
 * const nonEmpty: MinLengthArray<1, number> = rgb; // OK (3 >= 1)
 * // const rgba: FixedLengthArray<4, number> = rgb; // Error!
 * ```
 */
export type FixedLengthArray<
  Length extends number,
  Elm = unknown,
> = BoundedLengthArray<Length, Length, Elm>;
