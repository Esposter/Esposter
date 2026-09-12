import type { ESTree } from "@oxlint/plugins";

// A function bound to a name, with the scope that binding lives in — the table `notify()` is resolved against.
export interface FunctionBinding {
  isNotifying: boolean;
  name: string;
  node: ESTree.Node;
  scopeNode?: ESTree.Node;
}
