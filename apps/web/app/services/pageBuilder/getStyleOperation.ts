import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

// The operation that writes a node's style, so a field's edit and a paste write it the same way
export const getStyleOperation = (pointer: string, style: unknown): JsonPatchOperation => ({
  op: JsonPatchOperationType.Add,
  path: `${pointer}/props/style`,
  value: style,
});
