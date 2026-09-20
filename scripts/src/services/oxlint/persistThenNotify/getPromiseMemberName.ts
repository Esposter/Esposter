import type { ESTree } from "@oxlint/plugins";

// The static `Promise` member a node names — `reject` for `Promise.reject`, `all` for the callee of
// `Promise.all(…)` — or nothing when the node is not a plain read off the `Promise` identifier. Every question
// This plugin asks about a combinator, a rejection or a resolve starts from this one shape.
export const getPromiseMemberName = (node: ESTree.Node): string | undefined =>
  node.type === "MemberExpression" &&
  node.object.type === "Identifier" &&
  node.object.name === "Promise" &&
  node.property.type === "Identifier"
    ? node.property.name
    : undefined;
