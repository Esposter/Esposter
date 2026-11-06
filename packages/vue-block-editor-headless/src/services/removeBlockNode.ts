import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

// Removes the node a pointer names, with its subtree
export const removeBlockNode = (nodePointer: string): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Remove, path: nodePointer },
];
