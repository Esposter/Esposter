import type { ESTree } from "@oxlint/plugins";

import { APPLY_OPTIMISTIC_KEY } from "#src/services/oxlint/countWriteAfterSettle/constants";

// The function a mutation option holds as its `applyOptimistic`, which runs when the write is sent
export const checkIsApplyOptimisticFunction = (node: ESTree.Node): boolean =>
  node.parent?.type === "Property" &&
  node.parent.value === node &&
  node.parent.key.type === "Identifier" &&
  node.parent.key.name === APPLY_OPTIMISTIC_KEY;
