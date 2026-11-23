import type { Get, Paths } from "type-fest";

// The walk splits a dotted path the call site has already checked against Paths<TInput>, so the value it reads is the
// One Get names. The cast is that restatement, which any typed get needs, since the keys are only known as strings
export const getPropertyValue = <TInput, TPath extends Paths<TInput> & string>(
  input: TInput,
  path: TPath,
): Get<TInput, TPath> => {
  const value = path
    .split(".")
    .reduce<unknown>(
      (object, key) => (object === undefined || object === null ? undefined : Reflect.get(new Object(object), key)),
      input,
    );
  // The walk is by a dotted string, which the compiler cannot compute Get
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- from, so the value is the path's own type restated
  return value as Get<TInput, TPath>;
};
