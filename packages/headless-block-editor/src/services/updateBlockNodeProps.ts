import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType, toJsonPointer } from "@esposter/shared";

// One add per prop: a prop the node lacks is added and one it has is replaced, and the inverses restore the node
export const updateBlockNodeProps = (nodePointer: string, props: Record<string, unknown>): JsonPatchOperation[] =>
  Object.entries(props).map(([key, value]) => ({
    op: JsonPatchOperationType.Add,
    path: `${nodePointer}/props${toJsonPointer([key])}`,
    value,
  }));
