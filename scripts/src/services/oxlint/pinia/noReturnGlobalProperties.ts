import type { ESTree, Rule } from "@oxlint/plugins";

import { buildGlobalPropertyMessage, GLOBAL_CALLEE_NAMES } from "#src/services/oxlint/pinia/constants";
import { defineRule } from "@oxlint/plugins";

const checkIsFunction = (node: ESTree.Node): boolean =>
  node.type === "ArrowFunctionExpression" || node.type === "FunctionDeclaration" || node.type === "FunctionExpression";

// The functions a node sits in, innermost first. The program is the scope after the last of them, keyed by null
const enclosingFunctions = function* (node: ESTree.Node): Generator<ESTree.Node> {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (checkIsFunction(ancestor)) yield ancestor;
};

export const noReturnGlobalProperties: Rule = defineRule({
  create(context) {
    // The names each function binds, keyed by that function, with whether the binding is a global call
    // A name bound in one function is not a global in a sibling
    // A nested binding shadows the outer one, so a return reads the innermost binding of each name
    // A destructured binding names nothing, so it adds none
    const scopeBindingsMap = new Map<ESTree.Node | null, Map<string, boolean>>();
    const bind = (scope: ESTree.Node | null, name: string, isGlobal: boolean): void => {
      const bindings = scopeBindingsMap.get(scope) ?? new Map<string, boolean>();
      bindings.set(name, isGlobal);
      scopeBindingsMap.set(scope, bindings);
    };
    const checkIsGlobalName = (scopes: (ESTree.Node | null)[], name: string): boolean => {
      for (const scope of scopes) {
        const bindings = scopeBindingsMap.get(scope);
        if (bindings?.has(name)) return bindings.get(name) === true;
      }

      return false;
    };
    const bindParameters = (node: ESTree.ArrowFunctionExpression | ESTree.Function): void => {
      for (const parameter of node.params) if (parameter.type === "Identifier") bind(node, parameter.name, false);
    };

    return {
      ArrowFunctionExpression: bindParameters,
      FunctionDeclaration: bindParameters,
      FunctionExpression: bindParameters,
      ReturnStatement(node) {
        if (node.argument?.type !== "ObjectExpression") return;

        // A function nested in the binding's function still reads the global, so every enclosing scope counts
        const scopes = [...enclosingFunctions(node), null];
        for (const property of node.argument.properties) {
          if (property.type !== "Property" || property.value.type !== "Identifier") continue;
          const name = property.value.name;
          if (checkIsGlobalName(scopes, name))
            context.report({ message: buildGlobalPropertyMessage(name), node: property });
        }
      },
      VariableDeclaration(node) {
        const scope = enclosingFunctions(node).next().value ?? null;
        for (const { id, init } of node.declarations) {
          if (id.type !== "Identifier") continue;
          const isGlobal =
            init?.type === "CallExpression" &&
            init.callee.type === "Identifier" &&
            GLOBAL_CALLEE_NAMES.has(init.callee.name);
          bind(scope, id.name, isGlobal);
        }
      },
    };
  },
  meta: { type: "problem" },
});
