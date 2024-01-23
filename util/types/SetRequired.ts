import { type Except, type Simplify } from "type-fest";

export type SetRequired<BaseType, Keys extends keyof BaseType> =
  // `extends unknown` is always going to be the case and is used to convert any
  // union into a [distributive conditional
  // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
  BaseType extends unknown
    ? Simplify<
        // Pick just the keys that are optional from the base type.
        Except<BaseType, Keys> &
          // Pick the keys that should be required from the base type and make them required.
          Required<Pick<BaseType, Keys>>
      >
    : never;
