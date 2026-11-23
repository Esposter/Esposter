import type { ESTree } from "@oxlint/plugins";

// A value a failed Result falls back to that says nothing about the failure: nothing at all, or an empty value a
// Reader takes for "no items". A fallback that carries data (a schema, a default string) is not one
export const checkIsSentinel = (node: ESTree.Node): boolean =>
  (node.type === "Identifier" && node.name === "undefined") ||
  (node.type === "Literal" && (node.value === null || node.value === false || node.value === "")) ||
  (node.type === "ArrayExpression" && node.elements.length === 0) ||
  (node.type === "ObjectExpression" && node.properties.length === 0) ||
  (node.type === "NewExpression" &&
    node.arguments.length === 0 &&
    node.callee.type === "Identifier" &&
    (node.callee.name === "Map" || node.callee.name === "Set"));
