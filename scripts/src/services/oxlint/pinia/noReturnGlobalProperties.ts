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
    // The names bound to a global call, keyed by the function that binds them, so a name bound in one function is not a
    // global in a sibling. A destructured binding names nothing, so it adds none
    const scopeGlobalNamesMap = new Map<ESTree.Node | null, Set<string>>();
    return {
      ReturnStatement(node) {
        if (node.argument?.type !== "ObjectExpression") return;

        // A function nested in the binding's function still reads the global, so every enclosing scope counts
        const scopes = [...enclosingFunctions(node), null];
        for (const property of node.argument.properties) {
          if (property.type !== "Property" || property.value.type !== "Identifier") continue;
          const name = property.value.name;
          if (scopes.some((scope) => scopeGlobalNamesMap.get(scope)?.has(name)))
            context.report({ message: buildGlobalPropertyMessage(name), node: property });
        }
      },
      VariableDeclaration(node) {
        for (const { id, init } of node.declarations) {
          if (
            id.type !== "Identifier" ||
            init?.type !== "CallExpression" ||
            init.callee.type !== "Identifier" ||
            !GLOBAL_CALLEE_NAMES.has(init.callee.name)
          )
            continue;

          const scope = enclosingFunctions(node).next().value ?? null;
          const names = scopeGlobalNamesMap.get(scope) ?? new Set<string>();
          names.add(id.name);
          scopeGlobalNamesMap.set(scope, names);
        }
      },
    };
  },
  meta: { type: "problem" },
});
