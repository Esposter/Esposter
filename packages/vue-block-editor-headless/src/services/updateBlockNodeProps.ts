import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { JsonPatchOperation } from "@esposter/shared";

import { getBlockPropPointer } from "#src/services/getBlockPropPointer";
import { JsonPatchOperationType } from "@esposter/shared";

// One add per prop: a prop the node lacks is added and one it has is replaced, and the inverses restore the node
export const updateBlockNodeProps = <TProps extends BlockNodeProps>(
  nodePointer: string,
  props: Partial<TProps>,
): JsonPatchOperation[] =>
  Object.entries<unknown>(props).map(([key, value]) => ({
    op: JsonPatchOperationType.Add,
    path: getBlockPropPointer(nodePointer, key),
    value,
  }));
