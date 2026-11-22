import type { UndefinedToOptional } from "type-fest";

import { typedFromEntries } from "#src/util/object/typedFromEntries";

// Drops the keys whose value is undefined, so a spread over a default keeps the default rather than overwriting it, and
// An object can be handed to a type whose optional fields take no `undefined` under `exactOptionalPropertyTypes`
export const omitUndefined = <T extends object>(object: T): UndefinedToOptional<T> =>
  typedFromEntries<UndefinedToOptional<T>>(Object.entries(object).filter(([, value]) => value !== undefined));
