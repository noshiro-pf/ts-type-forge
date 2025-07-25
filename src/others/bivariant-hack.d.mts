/**
 * A type utility that makes the parameters of a function type `F` bivariant.
 *
 * By default, function parameters in TypeScript are contravariant. This "hack"
 * leverages a structural typing trick with object methods (which are bivariant in their parameters)
 * to bypass the stricter contravariance check.
 *
 * This is typically used in scenarios like defining event handlers or callbacks within
 * object types where strict contravariance might be too restrictive for practical use,
 * allowing assignment of functions with more specific parameter types.
 *
 * Use with caution, as it intentionally weakens type safety for parameter types.
 *
 * @template F - The function type whose parameters should be made bivariant.
 * @example
 * declare let func1: (arg: { a: string }) => void;
 * declare let func2: (arg: { a: string; b: number }) => void;
 *
 * // Normally, this assignment is invalid due to contravariance:
 * // func1 = func2; // Error: Type '(arg: { a: string; b: number; }) => void' is not assignable to type '(arg: { a: string; }) => void'.
 *
 * // Using BivariantHack allows the assignment:
 * declare let bivariantFunc1: BivariantHack<(arg: { a: string }) => void>;
 * bivariantFunc1 = func2; // OK
 */
type BivariantHack<F extends (...args: readonly never[]) => unknown> = {
  // eslint-disable-next-line @typescript-eslint/method-signature-style, functional/prefer-property-signatures
  bivariantHack(...args: Parameters<F>): ReturnType<F>;
}['bivariantHack'];
