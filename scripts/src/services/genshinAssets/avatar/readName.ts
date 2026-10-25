import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The name an object is exported under, which the asset index must give it
export const readName = (names: ReadonlyMap<string, string>, object: ResolvedObject): string => {
  const name = names.get(toObjectKey(object.file, object.pathId));
  if (name === undefined)
    throw new InvalidOperationError(Operation.Read, object.pathId, "has no name in the asset index");
  return name;
};
