import type { ESTree } from "@oxlint/plugins";

import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";

// The item whose node a source range lies within, the one each identifier is read as belonging to
export const findNodeContaining = <T extends { node: ESTree.Node }>(
  items: T[],
  range: [number, number],
): T | undefined => items.find((item) => checkIsRangeContaining(item.node.range, range));
