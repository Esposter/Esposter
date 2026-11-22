import type { UndefinedToOptional } from "type-fest";

// Drops the keys whose value is undefined, so a spread over a default keeps the default rather than overwriting it, and
// An object can be handed to a type whose optional fields take no `undefined` under `exactOptionalPropertyTypes`
export const omitUndefined = <T extends object>(object: T) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- UndefinedToOptional is the type of dropping the undefined keys at run time, which Object.fromEntries types as a bare record
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as UndefinedToOptional<T>;
