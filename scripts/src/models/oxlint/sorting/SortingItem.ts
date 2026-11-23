import type { ESTree } from "@oxlint/plugins";

export interface SortingItem {
  // The expression the item evaluates when the code runs, where a sort keeps an impure one in place
  evaluated?: ESTree.Node;
  // What the item sorts by: a key, a member's name, a type's source text
  name: string;
  node: ESTree.Node;
}
