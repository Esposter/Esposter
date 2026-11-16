import type { UndefinedToOptional } from "type-fest";

// Drops the keys whose value is undefined, so a spread over a default keeps the default rather than overwriting it, and
// An object can be handed to a type whose optional fields take no `undefined` under `exactOptionalPropertyTypes`
export const omitUndefined = <T extends object>(object: T) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as UndefinedToOptional<T>;
