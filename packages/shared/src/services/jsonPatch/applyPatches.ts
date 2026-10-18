import type { ApplyPatchesResult } from "#src/models/jsonPatch/ApplyPatchesResult";
import type { JsonPatchOperation } from "#src/models/jsonPatch/JsonPatchOperation";

import { applyPatch } from "#src/services/jsonPatch/applyPatch";

// Applies an RFC 6902 patch without touching the document it is handed, so a failed operation leaves nothing applied
// And the new document shares every subtree no operation reached. The inverses undo the whole patch in order
export const applyPatches = <T>(document: T, operations: JsonPatchOperation[]): ApplyPatchesResult<T> => {
  let patchedDocument: unknown = document;
  const inverseGroups: JsonPatchOperation[][] = [];
  for (const operation of operations) {
    const result = applyPatch(patchedDocument, operation);
    patchedDocument = result.document;
    inverseGroups.push(result.inverses);
  }
  // The caller vouches that its operations keep the document's shape, and one that cannot parses the result
  return { document: patchedDocument as T, inverses: inverseGroups.toReversed().flat() };
};
