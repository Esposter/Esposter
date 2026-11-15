import type { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";

// One RFC 6902 operation, its paths RFC 6901 JSON Pointers from the document's root
export type JsonPatchOperation = JsonPatchFromOperation | JsonPatchRemoveOperation | JsonPatchValueOperation;

interface JsonPatchFromOperation {
  from: string;
  op: typeof JsonPatchOperationType.Copy | typeof JsonPatchOperationType.Move;
  path: string;
}

interface JsonPatchRemoveOperation {
  op: typeof JsonPatchOperationType.Remove;
  path: string;
}

interface JsonPatchValueOperation {
  op: typeof JsonPatchOperationType.Add | typeof JsonPatchOperationType.Replace | typeof JsonPatchOperationType.Test;
  path: string;
  value: unknown;
}
