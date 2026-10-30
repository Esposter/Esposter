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

// The names a parameter binds, through a destructuring pattern, a default and a rest element
const getBoundNames = (parameter: ESTree.Node): string[] => {
  switch (parameter.type) {
    case "ArrayPattern":
      return parameter.elements.flatMap((element) => (element ? getBoundNames(element) : []));
    case "AssignmentPattern":
      return getBoundNames(parameter.left);
    case "Identifier":
      return [parameter.name];
    case "ObjectPattern":
      return parameter.properties.flatMap((property) =>
        getBoundNames(property.type === "RestElement" ? property : property.value),
      );
    case "RestElement":
      return getBoundNames(parameter.argument);
    default:
      return [];
  }
};

// The parameters a function binds, and the element one of them is when the function is a projecting callback
interface Scope {
  element?: string;
  names: string[];
}

export const noMapMutation: Rule = defineRule({
  create(context) {
    // The element parameter of each projecting callback, keyed by the callback so entering it records its name
    const elementNames = new WeakMap<CallbackFunction, string>();
    const scopes: Scope[] = [];

    const enterFunction = (node: CallbackFunction) => {
      const names = node.params.flatMap((parameter) => getBoundNames(parameter));
      scopes.push({ element: elementNames.get(node), names });
    };
    const exitFunction = () => {
      scopes.pop();
    };
    const checkTarget = (target: ESTree.Node) => {
      const rootName = getRootName(target);
      if (rootName === undefined) return;
      // The innermost function that binds the name decides it, so a parameter that shadows an element is not the element
      for (const { element, names } of scopes.toReversed()) {
        if (!names.includes(rootName)) continue;
        if (element === rootName) context.report({ message: MESSAGE, node: target });
        return;
      }
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
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
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
