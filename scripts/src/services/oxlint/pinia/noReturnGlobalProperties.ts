import type { ESTree, Rule } from "@oxlint/plugins";

import { buildGlobalPropertyMessage, GLOBAL_CALLEE_NAMES } from "#src/services/oxlint/pinia/constants";
import { getBoundNames } from "#src/services/oxlint/shared/getBoundNames";
import { defineRule } from "@oxlint/plugins";

const checkIsFunction = (node: ESTree.Node): boolean =>
  node.type === "ArrowFunctionExpression" || node.type === "FunctionDeclaration" || node.type === "FunctionExpression";

// The nodes that hold the `let`, `const` and destructured bindings written directly in them
const SCOPE_TYPES: ReadonlySet<string> = new Set([
  "ArrowFunctionExpression",
  "BlockStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "FunctionDeclaration",
  "FunctionExpression",
]);

// The functions a node sits in, innermost first. The program is the scope after the last of them, keyed by null
const enclosingFunctions = function* (node: ESTree.Node): Generator<ESTree.Node> {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (checkIsFunction(ancestor)) yield ancestor;
};

// The scopes a node sits in, innermost first, a block and a loop included. The program is the scope after the last,
// Keyed by null
const enclosingScopes = function* (node: ESTree.Node): Generator<ESTree.Node> {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
    if (SCOPE_TYPES.has(ancestor.type)) yield ancestor;
};

export const noReturnGlobalProperties: Rule = defineRule({
  create(context) {
    // The names each scope binds, keyed by that scope, with whether the binding is a global call
    // A name bound in one scope is not a global in a sibling
    // A nested binding shadows the outer one, so a return reads the innermost binding of each name
    // A destructured binding is never a global, but it still shadows the outer one of its name
    // A binding only shadows inside the block that holds it, except a `var`, which is function-scoped
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
      for (const parameter of node.params) for (const name of getBoundNames(parameter)) bind(node, name, false);
    };

    return {
      ArrowFunctionExpression: bindParameters,
      FunctionDeclaration: bindParameters,
      FunctionExpression: bindParameters,
      ReturnStatement(node) {
        if (node.argument?.type !== "ObjectExpression") return;

        // A function nested in the binding's function still reads the global, so every enclosing scope counts
        const scopes = [...enclosingScopes(node), null];
        for (const property of node.argument.properties) {
          if (property.type !== "Property" || property.value.type !== "Identifier") continue;
          const name = property.value.name;
          if (checkIsGlobalName(scopes, name))
            context.report({ message: buildGlobalPropertyMessage(name), node: property });
        }
      },
      VariableDeclaration(node) {
        const scope =
          node.kind === "var"
            ? (enclosingFunctions(node).next().value ?? null)
            : (enclosingScopes(node).next().value ?? null);
        for (const { id, init } of node.declarations) {
          const isGlobal =
            id.type === "Identifier" &&
            init?.type === "CallExpression" &&
            init.callee.type === "Identifier" &&
            GLOBAL_CALLEE_NAMES.has(init.callee.name);
          for (const name of getBoundNames(id)) bind(scope, name, isGlobal);
        }
      },
    };
  },
  meta: { type: "problem" },
});
