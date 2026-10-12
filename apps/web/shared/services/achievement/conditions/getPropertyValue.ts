import type { Get, Paths } from "type-fest";

// The walk splits a dotted path the call site has already checked against Paths<TInput>, so the value it reads is the one
// Get names. The cast is that restatement, which any typed get needs, since the keys are only known as strings
export const getPropertyValue = <TInput, TPath extends Paths<TInput> & string>(
  input: TInput,
  path: TPath,
): Get<TInput, TPath> =>
  path
    .split(".")
    .reduce<unknown>(
      (object, key) => (object === undefined || object === null ? undefined : Reflect.get(new Object(object), key)),
      input,
    ) as Get<TInput, TPath>;
