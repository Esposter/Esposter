import type { ESTree } from "@oxlint/plugins";

import { checkIsCallOf } from "#src/services/oxlint/propsInterface/checkIsCallOf";

// The declarator a props destructure is written in: `defineProps(...)` or `withDefaults(defineProps(...), {...})`,
// Typed or given runtime arguments. A destructure of anything else, a composable's return or a store, reads no prop.
export const checkIsDefinePropsDeclarator = (
  node: ESTree.VariableDeclarator,
): node is ESTree.VariableDeclarator & { id: ESTree.ObjectPattern; init: ESTree.CallExpression } => {
  if (node.id.type !== "ObjectPattern" || node.init?.type !== "CallExpression") return false;
  if (checkIsCallOf(node.init, "defineProps")) return true;
  const [props] = node.init.arguments;
  return checkIsCallOf(node.init, "withDefaults") && checkIsCallOf(props, "defineProps");
};
