import type { ApplyPatchesResult } from "#shared/models/jsonPatch/ApplyPatchesResult";

import { JsonPatchOperationType } from "#shared/models/jsonPatch/JsonPatchOperationType";
import { parseArrayIndex } from "#shared/services/jsonPatch/parseArrayIndex";
import { parseJsonPointer } from "#shared/services/jsonPatch/parseJsonPointer";
import { readJsonValue } from "#shared/services/jsonPatch/readJsonValue";
import { updateJsonValue } from "#shared/services/jsonPatch/updateJsonValue";
import { checkIsPlainObject, InvalidOperationError, Operation } from "@esposter/shared";

export const removeJsonValue = (document: unknown, path: string): ApplyPatchesResult<unknown> => {
  const segments = parseJsonPointer(path);
  const parentSegments = segments.slice(0, -1);
  const key = segments.at(-1);
  if (key === undefined) throw new InvalidOperationError(Operation.Delete, path, "the root cannot be removed");

  const parent = readJsonValue(document, parentSegments);
  const index = Array.isArray(parent) ? parseArrayIndex(key, parent.length - 1) : undefined;
  if (Array.isArray(parent) && index !== undefined)
    return {
      document: updateJsonValue(document, parentSegments, () => parent.toSpliced(index, 1)),
      inverses: [{ op: JsonPatchOperationType.Add, path, value: parent[index] }],
    };
  else if (checkIsPlainObject(parent) && Object.hasOwn(parent, key)) {
    const { [key]: removedValue, ...restParent } = parent;
    return {
      document: updateJsonValue(document, parentSegments, () => restParent),
      inverses: [{ op: JsonPatchOperationType.Add, path, value: removedValue }],
    };
  } else throw new InvalidOperationError(Operation.Delete, path, "no such member");
};
