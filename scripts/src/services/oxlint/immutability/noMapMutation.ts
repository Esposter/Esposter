import type { ESTree, Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/immutability/constants";
import { defineRule } from "@oxlint/plugins";

// The array methods whose callback produces the new element, so writing to the one it is given changes the source array
const PROJECTING_METHODS = new Set(["flatMap", "map"]);

type CallbackFunction = ESTree.ArrowFunctionExpression | ESTree.Function;

// The identifier a member chain such as `element.child.field` starts from, or nothing when it starts from anything else
const getRootName = (node: ESTree.Node): string | undefined => {
  let current = node;
  while (current.type === "MemberExpression") current = current.object;
  return current.type === "Identifier" && current !== node ? current.name : undefined;
};

export const noMapMutation: Rule = defineRule({
  create(context) {
    // The element parameter of each projecting callback, keyed by the callback so entering it pushes its name
    const elementNames = new WeakMap<CallbackFunction, string>();
    const activeNames: string[] = [];

    const enterFunction = (node: CallbackFunction) => {
      const name = elementNames.get(node);
      if (name !== undefined) activeNames.push(name);
    };
    const exitFunction = (node: CallbackFunction) => {
      if (elementNames.has(node)) activeNames.pop();
    };
    const checkTarget = (target: ESTree.Node) => {
      const rootName = getRootName(target);
      if (rootName !== undefined && activeNames.includes(rootName)) context.report({ message: MESSAGE, node: target });
    };

    return {
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      AssignmentExpression(node) {
        checkTarget(node.left);
      },
      CallExpression(node) {
        const { arguments: callArguments, callee } = node;
        if (
          callee.type !== "MemberExpression" ||
          callee.computed ||
          callee.property.type !== "Identifier" ||
          !PROJECTING_METHODS.has(callee.property.name)
        )
          return;

        const [callback] = callArguments;
        if (callback?.type !== "ArrowFunctionExpression" && callback?.type !== "FunctionExpression") return;

        const [parameter] = callback.params;
        if (parameter?.type === "Identifier") elementNames.set(callback, parameter.name);
      },
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      UnaryExpression(node) {
        if (node.operator === "delete") checkTarget(node.argument);
      },
      UpdateExpression(node) {
        checkTarget(node.argument);
      },
    };
  },
  meta: { type: "problem" },
});
