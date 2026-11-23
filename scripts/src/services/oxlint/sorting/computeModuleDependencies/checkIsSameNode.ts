import type { ESTree } from "@oxlint/plugins";

import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";

export const checkIsSameNode = (node: ESTree.Node, otherNode: ESTree.Node): boolean =>
  checkIsRangeContaining(node.range, otherNode.range) && checkIsRangeContaining(otherNode.range, node.range);
