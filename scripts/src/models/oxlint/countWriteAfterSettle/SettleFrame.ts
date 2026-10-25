import type { ESTree } from "@oxlint/plugins";

// Per-function frame: where each of the function's own awaits ends, where its first mutation call starts, and the
// Server-derived count writes it owns. A callback handed to a mutation as `applyOptimistic` hands its writes up.
export interface SettleFrame {
  awaitEnds: number[];
  mutationStart?: number;
  node: ESTree.Node;
  writes: ESTree.Node[];
}
