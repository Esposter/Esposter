import type { MergeObjectsStrict } from "#src/util/types/MergeObjectsStrict";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

// The objects merged into one namespace, refusing a key two of them share: the type refuses it at every pair, and the
// Merge throws on it here, so a collision a cast hid from the type fails when the merging module loads
export const mergeObjectsStrict = <T extends object[]>(...objects: T): MergeObjectsStrict<T> => {
  const merged: Record<string, unknown> = {};
  for (const object of objects)
    for (const [key, value] of Object.entries(object)) {
      if (Object.hasOwn(merged, key))
        throw new InvalidOperationError(Operation.Create, mergeObjectsStrict.name, `Duplicate key: ${key}`);
      merged[key] = value;
    }
  return merged as MergeObjectsStrict<T>;
};
