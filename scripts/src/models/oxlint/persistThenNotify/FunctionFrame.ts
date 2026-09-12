import type { ESTree } from "@oxlint/plugins";

// Per-function frame: the source position at which this function notifies, and the function node itself so a
// Nested emit can be attributed to the call that runs the callback holding it.
export interface FunctionFrame {
  emitStart?: number;
  node: ESTree.Node;
}
