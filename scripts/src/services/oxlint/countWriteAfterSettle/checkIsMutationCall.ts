import type { ESTree } from "@oxlint/plugins";

import { MUTATION_METHOD } from "#src/services/oxlint/countWriteAfterSettle/constants";

export const checkIsMutationCall = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "MemberExpression" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === MUTATION_METHOD;
