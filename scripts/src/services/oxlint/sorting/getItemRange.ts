import type { Context, ESTree } from "@oxlint/plugins";

import { computeBounds } from "#src/services/oxlint/sorting/getItemRange/computeBounds";
import { computeLeadingStart } from "#src/services/oxlint/sorting/getItemRange/computeLeadingStart";

// An item's range: the comments directly above it, its decorators, the node and any parentheses wrapping it
export const getItemRange = (context: Context, node: ESTree.Node): [number, number] => {
  const { first, last } = computeBounds(context, node);
  return [computeLeadingStart(context, first), last.range[1]];
};
