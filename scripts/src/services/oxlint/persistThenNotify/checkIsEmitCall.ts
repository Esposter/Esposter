import type { ESTree } from "@oxlint/plugins";

export const checkIsEmitCall = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "MemberExpression" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "emit" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name.endsWith("EventEmitter");
