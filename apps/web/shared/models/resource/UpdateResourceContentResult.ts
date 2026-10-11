import type { JsonPatchOperation } from "#shared/models/jsonPatch/JsonPatchOperation";

export interface UpdateResourceContentResult {
  contentVersion: number;
  // The operations that undo the patch, applied in order to the content this version holds
  inverseOperations: JsonPatchOperation[];
}
