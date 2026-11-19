import type { ESTree } from "@oxlint/plugins";

export const checkIsUseFakeTimersCall = ({ callee }: ESTree.CallExpression): boolean =>
  callee.type === "MemberExpression" &&
  callee.object.type === "Identifier" &&
  callee.object.name === "vi" &&
  callee.property.type === "Identifier" &&
  callee.property.name === "useFakeTimers";
