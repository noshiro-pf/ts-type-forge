/**
 * Represents the set of all JavaScript primitive types.
 * Includes `bigint`, `boolean`, `number`, `string`, `symbol`, `null`, and `undefined`.
 *
 * These are the seven primitive data types in JavaScript, as opposed to objects which are reference types.
 * Primitive values are immutable and are passed by value.
 *
 * @example
 * ```ts
 * type P1 = Primitive; // bigint | boolean | number | string | symbol | null | undefined
 *
 * const checkPrimitive = (value: unknown): value is Primitive => {
 *   return value !== Object(value);
 * };
 *
 * checkPrimitive(42);       // true (number)
 * checkPrimitive("hello");  // true (string)
 * checkPrimitive(true);     // true (boolean)
 * checkPrimitive(null);     // true (null)
 * checkPrimitive({});       // false (object)
 * checkPrimitive([]);       // false (array/object)
 * ```
 */
type Primitive = bigint | boolean | number | string | symbol | null | undefined;
