import type { ESTree } from "@oxlint/plugins";

// Whether a node sits anywhere under a `defineProps` call. A type reference reaches the macro through any depth
// Of composite — `A & B`, `Pick<A, "x">`, `A | B` — and a local declaration is no less local for being nested in
// One, so the ancestry decides membership rather than the shape of the argument.
export const checkIsUnderDefineProps = (node: ESTree.Node): boolean => {
  for (let current = node.parent; current; current = current.parent)
    if (current.type === "CallExpression")
      return current.callee.type === "Identifier" && current.callee.name === "defineProps";
  return false;
};
