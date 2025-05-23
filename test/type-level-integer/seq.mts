import { expectType } from '../expect-type.mjs';

expectType<Seq<3>, readonly [0, 1, 2]>('=');
expectType<Seq<0>, readonly []>('=');
expectType<Seq<1.2>, never>('=');
expectType<Seq<-1>, never>('=');
expectType<Seq<5>, readonly [0, 1, 2, 3, 4]>('=');
expectType<
  Seq<0 | 3 | 5>,
  readonly [] | readonly [0, 1, 2] | readonly [0, 1, 2, 3, 4]
>('=');
