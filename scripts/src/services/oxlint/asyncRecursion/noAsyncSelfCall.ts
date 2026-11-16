import type { ESTree, Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/asyncRecursion/constants";
import { defineRule } from "@oxlint/plugins";

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function;

// A call resolves to the function's own binding, its declared name or the variable an anonymous one is assigned to. A
// Parameter or a local that shares the name resolves to its own binding instead, so it is a different function
const checkIsOwnBinding = (definitions: { node: unknown; type: string }[], node: FunctionNode): boolean =>
  definitions.some((definition) =>
    definition.type === "FunctionName"
      ? definition.node === node
      : definition.type === "Variable" && (definition.node as ESTree.VariableDeclarator).init === node,
  );

// Reports a call to an async function from its own body. A call from a callback nested inside it — a `map` over a
// Tree's children — is the callback's, so a walk that runs its branches together is left alone
export const noAsyncSelfCall: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    const functionStack: FunctionNode[] = [];
    const enter = (node: FunctionNode) => {
      functionStack.push(node);
    };
    const exit = () => {
      functionStack.pop();
    };
    return {
      ArrowFunctionExpression: enter,
      "ArrowFunctionExpression:exit": exit,
      CallExpression(node) {
        const current = functionStack.at(-1);
        if (!current?.async || node.callee.type !== "Identifier") return;
        const reference = sourceCode.getScope(node).references.find(({ identifier }) => identifier === node.callee);
        if (reference?.resolved && checkIsOwnBinding(reference.resolved.defs, current))
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
