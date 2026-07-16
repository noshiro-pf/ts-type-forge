import { expectType } from 'ts-data-forge';
import { type ArrayOfLength } from '../../tuple-and-list/index.mjs';
import { type MaxLengthString } from '../predefined-strings/index.mjs';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from './length-constrained-array.mjs';

// MaxLengthArray

{
  expectType<
    MaxLengthArray<3, number>,
    readonly number[] &
      Readonly<{
        MaxLength: 0 | 1 | 2 | 3;
      }> &
      Readonly<{
        'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
      }>
  >('=');

  // Reflexivity
  expectType<MaxLengthArray<3, number>, MaxLengthArray<3, number>>('=');

  // Covariance in the bound: M <= N implies MaxLengthArray<M> <= MaxLengthArray<N>
  expectType<MaxLengthArray<3, number>, MaxLengthArray<5, number>>('<=');

  expectType<MaxLengthArray<0, number>, MaxLengthArray<1, number>>('<=');

  expectType<MaxLengthArray<0, number>, MaxLengthArray<255, number>>('<=');

  // Negative direction
  expectType<MaxLengthArray<5, number>, MaxLengthArray<3, number>>('!<=');

  expectType<MaxLengthArray<1, number>, MaxLengthArray<0, number>>('!<=');

  // Covariance in the element type
  expectType<MaxLengthArray<3, 1 | 2>, MaxLengthArray<3, number>>('<=');

  expectType<MaxLengthArray<3, number>, MaxLengthArray<3, 1 | 2>>('!<=');

  // Elm defaults to unknown
  expectType<MaxLengthArray<3, number>, MaxLengthArray<3>>('<=');

  // Subtype of readonly Elm[], but a plain array is not assignable to it
  expectType<MaxLengthArray<3, number>, readonly number[]>('<=');

  expectType<readonly number[], MaxLengthArray<3, number>>('!<=');
}

// MinLengthArray

{
  expectType<
    MinLengthArray<3, number>,
    readonly number[] &
      Readonly<{
        MinLength: readonly [0, 0, 0, ...(readonly 0[])];
      }> &
      Readonly<{
        'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
      }>
  >('=');

  // Reflexivity
  expectType<MinLengthArray<3, number>, MinLengthArray<3, number>>('=');

  // M >= N implies MinLengthArray<M> <= MinLengthArray<N>
  expectType<MinLengthArray<5, number>, MinLengthArray<3, number>>('<=');

  expectType<MinLengthArray<1, number>, MinLengthArray<0, number>>('<=');

  expectType<MinLengthArray<255, number>, MinLengthArray<0, number>>('<=');

  // Negative direction
  expectType<MinLengthArray<3, number>, MinLengthArray<5, number>>('!<=');

  expectType<MinLengthArray<0, number>, MinLengthArray<1, number>>('!<=');

  // Covariance in the element type
  expectType<MinLengthArray<3, 1 | 2>, MinLengthArray<3, number>>('<=');

  expectType<MinLengthArray<3, number>, MinLengthArray<3, 1 | 2>>('!<=');

  // Elm defaults to unknown
  expectType<MinLengthArray<3, number>, MinLengthArray<3>>('<=');

  // Subtype of readonly Elm[], but a plain array is not assignable to it
  expectType<MinLengthArray<3, number>, readonly number[]>('<=');

  expectType<readonly number[], MinLengthArray<3, number>>('!<=');
}

// MinLengthArray and MaxLengthArray are independent brands

{
  expectType<MinLengthArray<3, number>, MaxLengthArray<3, number>>('!<=');

  expectType<MaxLengthArray<3, number>, MinLengthArray<3, number>>('!<=');
}

// The array brands are independent of the string brands with the same keys

{
  expectType<MaxLengthString<3>, MaxLengthArray<3, string>>('!<=');

  expectType<MaxLengthArray<3, string>, MaxLengthString<3>>('!<=');
}

// BoundedLengthArray

{
  expectType<
    BoundedLengthArray<2, 5, number>,
    readonly number[] &
      Readonly<{
        MinLength: readonly [0, 0, ...(readonly 0[])];
      }> &
      Readonly<{
        MaxLength: 0 | 1 | 2 | 3 | 4 | 5;
      }> &
      Readonly<{
        'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
      }>
  >('=');

  expectType<
    BoundedLengthArray<2, 5, number>,
    MaxLengthArray<5, number> & MinLengthArray<2, number>
  >('=');

  // Weakening either bound is allowed
  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<5, number>>('<=');

  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<10, number>>(
    '<=',
  );

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<2, number>>('<=');

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<1, number>>('<=');

  expectType<
    BoundedLengthArray<2, 5, number>,
    BoundedLengthArray<1, 10, number>
  >('<=');

  expectType<BoundedLengthArray<2, 5, number>, readonly number[]>('<=');

  // Strengthening a bound is not allowed
  expectType<
    BoundedLengthArray<1, 10, number>,
    BoundedLengthArray<2, 5, number>
  >('!<=');

  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<4, number>>(
    '!<=',
  );

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<3, number>>(
    '!<=',
  );

  expectType<readonly number[], BoundedLengthArray<2, 5, number>>('!<=');
}

// FixedLengthArray

{
  expectType<FixedLengthArray<3, number>, BoundedLengthArray<3, 3, number>>(
    '=',
  );

  expectType<FixedLengthArray<3, number>, BoundedLengthArray<0, 3, number>>(
    '<=',
  );

  expectType<FixedLengthArray<3, number>, BoundedLengthArray<3, 100, number>>(
    '<=',
  );

  expectType<FixedLengthArray<3, number>, MaxLengthArray<3, number>>('<=');

  expectType<FixedLengthArray<3, number>, MinLengthArray<3, number>>('<=');

  expectType<FixedLengthArray<3, number>, FixedLengthArray<4, number>>('!<=');

  expectType<FixedLengthArray<4, number>, FixedLengthArray<3, number>>('!<=');

  expectType<BoundedLengthArray<3, 3, number>, FixedLengthArray<4, number>>(
    '!<=',
  );
}

// Unrelated to the structural tuple-based family (ArrayOfLength etc.)

{
  expectType<FixedLengthArray<3, number>, ArrayOfLength<3, number>>('!<=');

  expectType<ArrayOfLength<3, number>, FixedLengthArray<3, number>>('!<=');
}

// Supports large length parameters that the tuple-based family cannot handle
// (ArrayAtMostLen / ArrayBoundedLen hit the recursion limit around N > 100)

{
  expectType<MaxLengthArray<500, number>, MaxLengthArray<1000, number>>('<=');

  expectType<MinLengthArray<1000, number>, MinLengthArray<500, number>>('<=');

  expectType<
    BoundedLengthArray<100, 1000, number>,
    BoundedLengthArray<0, 2000, number>
  >('<=');
}
