import type { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";

// One RFC 6902 operation, its paths RFC 6901 JSON Pointers from the document's root
export type JsonPatchOperation = JsonPatchFromOperation | JsonPatchRemoveOperation | JsonPatchValueOperation;

interface JsonPatchFromOperation {
  from: string;
  op: JsonPatchOperationType.Copy | JsonPatchOperationType.Move;
  path: string;
}

interface JsonPatchRemoveOperation {
  op: JsonPatchOperationType.Remove;
  path: string;
}

interface JsonPatchValueOperation {
  op: JsonPatchOperationType.Add | JsonPatchOperationType.Replace | JsonPatchOperationType.Test;
  path: string;
  value: unknown;
}
