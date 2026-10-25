import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

// The operations that take a node's style from its current one to the next, so a field's edit and a paste write it the
// Same way. A style that sets nothing is removed, and removing a style the node never had is no operation
export const getStyleOperations = (
  pointer: string,
  current: NodeStyle | undefined,
  next: NodeStyle,
): JsonPatchOperation[] => {
  const path = `${pointer}/props/style`;
  if (Object.keys(next).length > 0) return [{ op: JsonPatchOperationType.Add, path, value: next }];

  return current === undefined ? [] : [{ op: JsonPatchOperationType.Remove, path }];
};
