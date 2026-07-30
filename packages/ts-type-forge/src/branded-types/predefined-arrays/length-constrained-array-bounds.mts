import { type IsNever, type TypeExtends } from '../../condition/index.mjs';
import { type BoolAnd, type BoolNot } from '../../others/index.mjs';
import {
  type FixedLengthTuple,
  type MinLengthTuple,
} from '../../tuple-and-list/index.mjs';
import { type UintRangeInclusive } from '../../type-level-integer/index.mjs';
import { type StructuralPrefixCap } from './length-constrained-array.mjs';

/**
 * Whether `Ar` carries a length-constraint brand — i.e. whether it came from the
 * `MinLengthArray` / `MaxLengthArray` / `BoundedLengthArray` /
 * `FixedLengthArray` family rather than being a plain array or tuple.
 *
 * @template Ar - The array type to inspect.
 *
 * @example
 * ```ts
 * type A = HasLengthConstraint<MinLengthArray<3, string>>; // true
 * type B = HasLengthConstraint<readonly [string, string]>; // false
 * type C = HasLengthConstraint<readonly string[]>; // false
 * ```
 */
export type HasLengthConstraint<Ar extends readonly unknown[]> = BoolNot<
  IsNever<LengthConstraintKeysOf<Ar>>
>;

/**
 * The length-constraint brand carried by `Ar`, as an object type — the members
 * that are neither array members nor tuple indices. Resolves to `{}` for a plain
 * array or tuple, so intersecting with it is a no-op.
 *
 * Use this to carry a constraint over to a differently-shaped array without
 * depending on how the brand is encoded:
 * `readonly Elm[] & LengthConstraintBrandOf<Ar>`.
 *
 * @template Ar - The array type to take the brand from.
 */
export type LengthConstraintBrandOf<Ar extends readonly unknown[]> = Pick<
  Ar,
  LengthConstraintKeysOf<Ar>
>;

/**
 * The minimum length `Ar`'s brand guarantees, or `0` when it constrains no
 * lower bound (including for a plain array or tuple, whose minimum the brand
 * does not describe).
 *
 * The bound is recovered from the brand rather than remembered separately: the
 * brand encodes it as `MinLengthTuple<MinLength, 0>` so that the natural
 * subtyping relation between constraints is preserved, and this counts that
 * tuple's fixed prefix back. Nothing large is instantiated in the process — the
 * recursion is one step per unit of `MinLength`, so it stays within
 * TypeScript's instantiation-depth limit for realistic bounds (it is not
 * intended for bounds in the thousands).
 *
 * @template Ar - The array type to inspect.
 *
 * @example
 * ```ts
 * type A = MinLengthOf<MinLengthArray<3, string>>; // 3
 * type B = MinLengthOf<BoundedLengthArray<2, 5, string>>; // 2
 * type C = MinLengthOf<FixedLengthArray<4, string>>; // 4
 * type D = MinLengthOf<MaxLengthArray<5, string>>; // 0
 * type E = MinLengthOf<readonly [string, string]>; // 0
 * ```
 */
export type MinLengthOf<Ar extends readonly unknown[]> =
  Ar extends MinLengthConstraintBrand<infer Prefix>
    ? CountFixedPrefix<Prefix>
    : 0;

/**
 * The maximum length `Ar`'s brand allows, or `never` when it constrains no
 * upper bound (including for a plain array or tuple, whose maximum the brand
 * does not describe).
 *
 * The bound is recovered from the brand rather than remembered separately: the
 * brand encodes it as the union `UintRangeInclusive<0, MaxLength>` so that the
 * natural subtyping relation between constraints is preserved, and this counts
 * that union's members back. The union is already materialized by the brand
 * itself, so nothing extra is instantiated; as with {@link MinLengthOf}, the
 * recursion is one step per unit of `MaxLength`.
 *
 * @template Ar - The array type to inspect.
 *
 * @example
 * ```ts
 * type A = MaxLengthOf<MaxLengthArray<5, string>>; // 5
 * type B = MaxLengthOf<BoundedLengthArray<2, 5, string>>; // 5
 * type C = MaxLengthOf<FixedLengthArray<4, string>>; // 4
 * type D = MaxLengthOf<MinLengthArray<3, string>>; // never
 * type E = MaxLengthOf<readonly [string, string]>; // never
 * ```
 */
export type MaxLengthOf<Ar extends readonly unknown[]> =
  Ar extends MaxLengthConstraintBrand<infer Allowed>
    ? CountContiguousUintUnion<Allowed>
    : never;

/**
 * Replaces the element type of `Ar` with `Elm`, keeping its length exactly as
 * it was — **including** a branded length constraint, which a plain homomorphic
 * mapped type cannot preserve.
 *
 * For a plain array or tuple this is the homomorphic
 * `Readonly<{ [K in keyof Ar]: Elm }>`, so tuples keep mapping element-wise and
 * plain arrays stay plain arrays.
 *
 * For a length-constrained array the homomorphic mapping cannot be used at all:
 * such a type is an intersection of a tuple and the brand object, which
 * TypeScript does not treat as an array type, so mapping over `keyof Ar` yields
 * a non-array object (it maps `length`, the array methods and the brand keys to
 * `Elm` as well). This rebuilds the structural part from the bounds recovered
 * from the brand and intersects the original brand back on.
 *
 * @template Ar - The array type whose length (and constraint) to keep.
 * @template Elm - The element type of the result.
 *
 * @example
 * ```ts
 * type A = ChangeArrayElement<MinLengthArray<3, number>, string>;
 * // MinLengthArray<3, string>
 *
 * type B = ChangeArrayElement<FixedLengthArray<3, number>, string>;
 * // FixedLengthArray<3, string>
 *
 * type C = ChangeArrayElement<readonly [number, number], string>;
 * // readonly [string, string]
 *
 * type D = ChangeArrayElement<readonly number[], string>; // readonly string[]
 * ```
 */
export type ChangeArrayElement<Ar extends readonly unknown[], Elm> =
  HasLengthConstraint<Ar> extends true
    ? ConstrainedStructureOf<Ar, Elm> & LengthConstraintBrandOf<Ar>
    : Readonly<{ [K in keyof Ar]: Elm }>;

/**
 * @internal The members of `Ar` that are neither array members nor tuple
 * indices — i.e. exactly the length-constraint brand, marker key included,
 * without naming the marker.
 */
type LengthConstraintKeysOf<Ar extends readonly unknown[]> = Exclude<
  keyof Ar,
  keyof (readonly unknown[]) | `${number}`
>;

/**
 * @internal The shape a lower-bound brand contributes, with the encoded prefix
 * left inferrable.
 */
type MinLengthConstraintBrand<Prefix extends readonly 0[]> = Readonly<{
  MinLength: Prefix;
}>;

/**
 * @internal The shape an upper-bound brand contributes, with the encoded range
 * left inferrable.
 */
type MaxLengthConstraintBrand<Allowed extends number> = Readonly<{
  MaxLength: Allowed;
}>;

/**
 * @internal Counts the leading fixed elements of `MinLengthTuple<N, 0>` back to
 * `N`, by peeling one element per step until only the rest element is left.
 */
type CountFixedPrefix<
  Prefix extends readonly unknown[],
  Counter extends readonly 0[] = [],
> = Prefix extends readonly [unknown, ...infer Rest]
  ? CountFixedPrefix<Rest, [...Counter, 0]>
  : Counter['length'];

/**
 * @internal Counts the members of a contiguous `0 | 1 | ... | Max` union back to
 * `Max`, by removing the current counter value one step at a time.
 */
type CountContiguousUintUnion<
  Allowed extends number,
  Counter extends readonly 0[] = [],
> = [Exclude<Allowed, Counter['length']>] extends [never]
  ? Counter['length']
  : CountContiguousUintUnion<
      Exclude<Allowed, Counter['length']>,
      [...Counter, 0]
    >;

/**
 * @internal The structural part to pair a recovered brand with: the exact tuple
 * when the bounds pin a single length within {@link StructuralPrefixCap}, and
 * the minimum-length tuple otherwise — matching what `FixedLengthArray`
 * and `MinLengthArray` encode structurally.
 */
type ConstrainedStructureOf<Ar extends readonly unknown[], Elm> =
  IsExactLengthWithinCap<Ar> extends true
    ? FixedLengthTuple<MinLengthOf<Ar>, Elm>
    : MinLengthTuple<ClampToPrefixCap<MinLengthOf<Ar>>, Elm>;

/**
 * @internal Whether `Ar`'s bounds pin one length at or below the cap.
 *
 * `TypeExtends` rather than a bare conditional: both operands are computed
 * types, never a naked type parameter, so nothing distributes either way.
 */
type IsExactLengthWithinCap<Ar extends readonly unknown[]> = BoolAnd<
  TypeExtends<MinLengthOf<Ar>, MaxLengthOf<Ar>>,
  TypeExtends<MinLengthOf<Ar>, UintRangeInclusive<0, StructuralPrefixCap>>
>;

/** @internal Clamps `N` to {@link StructuralPrefixCap}. */
type ClampToPrefixCap<N extends number> =
  N extends UintRangeInclusive<0, StructuralPrefixCap>
    ? N
    : StructuralPrefixCap;
