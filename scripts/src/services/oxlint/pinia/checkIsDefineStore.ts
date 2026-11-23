import type { ESTree } from "@oxlint/plugins";

import { DEFINE_STORE_NAME } from "#src/services/oxlint/pinia/constants";

// A call to Pinia's `defineStore` by its own name, the one callee every rule here reads
export const checkIsDefineStore = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "Identifier" && node.callee.name === DEFINE_STORE_NAME;
