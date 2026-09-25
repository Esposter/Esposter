import type { ESTree } from "@oxlint/plugins";

import { COMPOSABLE_NAME_REGEX, SETUP_CALLEE_NAMES } from "#src/services/oxlint/setupScope/constants";

// A function whose body runs once, where a setup does: a `use*` composable, declared or bound, or the setup
// Callback handed to Pinia's `defineStore` or Nuxt's `defineNuxtPlugin`
export const checkIsSetupFunction = (node: ESTree.ArrowFunctionExpression | ESTree.Function): boolean => {
  if (node.type === "FunctionDeclaration") return Boolean(node.id && COMPOSABLE_NAME_REGEX.test(node.id.name));

  const { parent } = node;
  if (parent.type === "VariableDeclarator")
    return parent.id.type === "Identifier" && COMPOSABLE_NAME_REGEX.test(parent.id.name);
  else if (parent.type === "CallExpression")
    return parent.callee.type === "Identifier" && SETUP_CALLEE_NAMES.includes(parent.callee.name);
  else return false;
};
