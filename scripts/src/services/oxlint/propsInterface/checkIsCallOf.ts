import type { ESTree } from "@oxlint/plugins";

// Whether a node is a call to the named identifier. A macro is recognised by its callee's spelling, the way the
// Vue compiler recognises `defineProps` and `withDefaults` in an SFC, so no import is needed to name one.
export const checkIsCallOf = (node: ESTree.Node | undefined, name: string): boolean =>
  node?.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === name;
