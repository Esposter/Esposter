import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

import { readName } from "#src/services/genshinAssets/avatar/readName";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Two different objects under one name share one exported file, so it is an error, never one of them picked over the other
export const assertUniqueNames = (
  objects: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  kind: string,
): void => {
  const keyOfName = new Map<string, string>();
  for (const object of objects) {
    const key = toObjectKey(object.file, object.pathId);
    const name = readName(names, object);
    const other = keyOfName.get(name);
    if (other !== undefined && other !== key)
      throw new InvalidOperationError(Operation.Read, name, `names two different ${kind}s`);
    keyOfName.set(name, key);
  }
};
