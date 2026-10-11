import type { JsonPatchOperation } from "#shared/models/jsonPatch/JsonPatchOperation";

export interface ApplyPatchesResult<T> {
  document: T;
  // The operations that undo the patch, in the order they apply
  inverses: JsonPatchOperation[];
}
