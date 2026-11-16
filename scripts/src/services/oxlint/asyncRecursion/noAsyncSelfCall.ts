import type { ESTree, Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/asyncRecursion/constants";
import { defineRule } from "@oxlint/plugins";

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function;

// A function's own name, or the name of the variable an anonymous one is bound to
const getFunctionName = (node: FunctionNode): string | undefined => {
  if ("id" in node && node.id) return node.id.name;
  const { parent } = node;
  return parent.type === "VariableDeclarator" && parent.id.type === "Identifier" ? parent.id.name : undefined;
};

// Reports a call to an async function from its own body. A call from a callback nested inside it — a `map` over a
// Tree's children — is the callback's, so a walk that runs its branches together is left alone
export const noAsyncSelfCall: Rule = defineRule({
  create(context) {
    const functionStack: { isAsync: boolean; name: string | undefined }[] = [];
    const enter = (node: FunctionNode) => {
      functionStack.push({ isAsync: node.async, name: getFunctionName(node) });
    };
    const exit = () => {
      functionStack.pop();
    };
    return {
      ArrowFunctionExpression: enter,
      "ArrowFunctionExpression:exit": exit,
      CallExpression(node) {
        const current = functionStack.at(-1);
        if (
          current?.isAsync &&
          current.name !== undefined &&
          node.callee.type === "Identifier" &&
          node.callee.name === current.name
        )
          context.report({ message: MESSAGE, node });
      },
      FunctionDeclaration: enter,
      "FunctionDeclaration:exit": exit,
      FunctionExpression: enter,
      "FunctionExpression:exit": exit,
    };
  },
  meta: { type: "suggestion" },
});
