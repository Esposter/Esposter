import type { ESTree } from "@oxlint/plugins";

export const checkIsPromiseReject = (node: ESTree.Node): boolean =>
  (node.type === "MemberExpression" &&
    node.object.type === "Identifier" &&
    node.object.name === "Promise" &&
    node.property.type === "Identifier" &&
    node.property.name === "reject") ||
  (node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier" &&
    node.callee.object.name === "Promise" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "reject");
