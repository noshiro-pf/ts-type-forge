import { expectType } from 'ts-data-forge';
import { type IntRange } from './int-range.mjs';
import { type UintRange } from './uint-range.mjs';

expectType<IntRange<1, 5>, 1 | 2 | 3 | 4>('=');

expectType<IntRange<-3, 3>, -3 | -2 | -1 | 0 | 1 | 2>('=');

expectType<IntRange<3, -3>, never>('=');

expectType<IntRange<-5, -1>, -5 | -4 | -3 | -2>('=');

// single-element ranges
expectType<IntRange<0, 1>, 0>('=');

expectType<IntRange<-1, 0>, -1>('=');

// empty ranges
expectType<IntRange<0, 0>, never>('=');

expectType<IntRange<5, 5>, never>('=');

expectType<IntRange<-5, -5>, never>('=');

expectType<IntRange<5, 1>, never>('=');

expectType<IntRange<-1, -5>, never>('=');

expectType<IntRange<0, -1>, never>('=');

// matches UintRange when both bounds are non-negative
expectType<IntRange<3, 7>, UintRange<3, 7>>('=');

// boundary values (double as an instantiation-depth smoke test)
expectType<-128, IntRange<-128, 128>>('<=');

expectType<0, IntRange<-128, 128>>('<=');

expectType<127, IntRange<-128, 128>>('<=');

expectType<128, IntRange<-128, 128>>('!<=');

expectType<-129, IntRange<-128, 128>>('!<=');
