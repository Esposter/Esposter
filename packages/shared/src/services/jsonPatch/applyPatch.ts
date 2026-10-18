import type { ApplyPatchesResult } from "#src/models/jsonPatch/ApplyPatchesResult";
import type { JsonPatchOperation } from "#src/models/jsonPatch/JsonPatchOperation";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";
import { Operation } from "#src/models/shared/Operation";
import { addJsonValue } from "#src/services/jsonPatch/addJsonValue";
import { parseJsonPointer } from "#src/services/jsonPatch/parseJsonPointer";
import { readJsonValue } from "#src/services/jsonPatch/readJsonValue";
import { removeJsonValue } from "#src/services/jsonPatch/removeJsonValue";
import { updateJsonValue } from "#src/services/jsonPatch/updateJsonValue";
import { checkIsDeepEqual } from "#src/util/object/checkIsDeepEqual";
import { exhaustiveGuard } from "#src/util/validation/exhaustiveGuard";

export const applyPatch = (document: unknown, operation: JsonPatchOperation): ApplyPatchesResult<unknown> => {
  switch (operation.op) {
    case JsonPatchOperationType.Add:
      return addJsonValue(document, operation.path, operation.value);
    case JsonPatchOperationType.Copy:
      return addJsonValue(document, operation.path, readJsonValue(document, parseJsonPointer(operation.from)));
    case JsonPatchOperationType.Move: {
      if (operation.from === operation.path) {
        readJsonValue(document, parseJsonPointer(operation.from));
        return { document, inverses: [] };
      } else if (operation.path.startsWith(`${operation.from}/`))
        throw new InvalidOperationError(Operation.Update, operation.path, "a value cannot move into itself");

      const removed = removeJsonValue(document, operation.from);
      const added = addJsonValue(
        removed.document,
        operation.path,
        readJsonValue(document, parseJsonPointer(operation.from)),
      );
      return { document: added.document, inverses: [...added.inverses, ...removed.inverses] };
    }
    case JsonPatchOperationType.Remove:
      return removeJsonValue(document, operation.path);
    case JsonPatchOperationType.Replace: {
      const segments = parseJsonPointer(operation.path);
      const replacedValue = readJsonValue(document, segments);
      return {
        document: updateJsonValue(document, segments, () => operation.value),
        inverses: [{ op: JsonPatchOperationType.Replace, path: operation.path, value: replacedValue }],
      };
    }
    case JsonPatchOperationType.Test:
      if (!checkIsDeepEqual(readJsonValue(document, parseJsonPointer(operation.path)), operation.value))
        throw new InvalidOperationError(Operation.Read, operation.path, "the value differs from the test's");
      return { document, inverses: [] };
    default:
      return exhaustiveGuard(operation);
  }
};
