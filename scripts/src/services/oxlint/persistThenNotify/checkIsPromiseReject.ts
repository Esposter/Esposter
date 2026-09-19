import type { ESTree } from "@oxlint/plugins";

import { getPromiseMemberName } from "#src/services/oxlint/persistThenNotify/getPromiseMemberName";

// `Promise.reject` handed over as a callee, or called
export const checkIsPromiseReject = (node: ESTree.Node): boolean =>
  getPromiseMemberName(node.type === "CallExpression" ? node.callee : node) === "reject";
