import type { ApplyPatchesResult } from "#src/models/jsonPatch/ApplyPatchesResult";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";
import { Operation } from "#src/models/shared/Operation";
import { APPEND_SEGMENT } from "#src/services/jsonPatch/constants";
import { parseArrayIndex } from "#src/services/jsonPatch/parseArrayIndex";
import { parseJsonPointer } from "#src/services/jsonPatch/parseJsonPointer";
import { readJsonValue } from "#src/services/jsonPatch/readJsonValue";
import { toJsonPointer } from "#src/services/jsonPatch/toJsonPointer";
import { updateJsonValue } from "#src/services/jsonPatch/updateJsonValue";
import { checkIsPlainObject } from "#src/util/object/checkIsPlainObject";

export const addJsonValue = (document: unknown, path: string, value: unknown): ApplyPatchesResult<unknown> => {
  const segments = parseJsonPointer(path);
  const parentSegments = segments.slice(0, -1);
  const key = segments.at(-1);
  if (key === undefined)
    return { document: value, inverses: [{ op: JsonPatchOperationType.Replace, path, value: document }] };

  const parent = readJsonValue(document, parentSegments);
  if (Array.isArray(parent)) {
    const index = key === APPEND_SEGMENT ? parent.length : parseArrayIndex(key, parent.length);
    if (index === undefined) throw new InvalidOperationError(Operation.Update, path, "no such index in the array");
    return {
      document: updateJsonValue(document, parentSegments, () => parent.toSpliced(index, 0, value)),
      inverses: [{ op: JsonPatchOperationType.Remove, path: toJsonPointer([...parentSegments, `${index}`]) }],
    };
  } else if (checkIsPlainObject(parent))
    return {
      document: updateJsonValue(document, parentSegments, () => ({ ...parent, [key]: value })),
      inverses: [
        Object.hasOwn(parent, key)
          ? { op: JsonPatchOperationType.Replace, path, value: parent[key] }
          : { op: JsonPatchOperationType.Remove, path },
      ],
    };
  else throw new InvalidOperationError(Operation.Update, path, "its parent holds no members");
};
