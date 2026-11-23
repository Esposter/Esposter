import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

import { collectNodes } from "#src/services/oxlint/errorHandling/collectNodes";
import { UNFINALIZED_RESOURCE_MESSAGE } from "#src/services/oxlint/errorHandling/constants";
import { defineRule } from "@oxlint/plugins";

const FINALIZER_NAMES: ReadonlySet<string> = new Set(["withFinalizer", "withFinalizerAsync"]);
const FUNCTION_TYPES: ReadonlySet<string> = new Set([
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
]);
// The methods a finalizer calls on what it releases, the words a resource is closed by across the repository
const RELEASE_METHODS: ReadonlySet<string> = new Set([
  "close",
  "destroy",
  "disconnect",
  "dispose",
  "end",
  "kill",
  "release",
  "stop",
  "terminate",
  "unlock",
]);

const getEnclosingFunction = (node: ESTree.Node): ESTree.Node | null => {
  let current: ESTree.Node | null = node.parent;
  while (current && !FUNCTION_TYPES.has(current.type)) current = current.parent;
  return current;
};

const getRootIdentifier = (node: ESTree.Node): ESTree.Node | undefined =>
  node.type === "MemberExpression" ? getRootIdentifier(node.object) : node.type === "Identifier" ? node : undefined;

// The declarator an identifier reads, when a variable's `await` bound it: a resource awaited into a name
const getAwaitedDeclarator = (
  identifier: ESTree.Node,
  sourceCode: SourceCode,
): ESTree.VariableDeclarator | undefined => {
  const reference = sourceCode
    .getScope(identifier)
    .references.find(({ identifier: referenced }) => referenced === identifier);
  const definition = reference?.resolved?.defs.find(
    ({ node, type }) =>
      type === "Variable" && node.type === "VariableDeclarator" && node.init?.type === "AwaitExpression",
  );
  return definition?.node.type === "VariableDeclarator" ? definition.node : undefined;
};

// A binding gathered by `Promise.all` is open the moment its sibling rejects, so a rejection of any one of them leaves
// It Open too: the finalizer is never reached
const checkIsGathered = (declarator: ESTree.VariableDeclarator): boolean => {
  if (declarator.init?.type !== "AwaitExpression") return false;
  const { argument } = declarator.init;
  return (
    argument.type === "CallExpression" &&
    argument.callee.type === "MemberExpression" &&
    argument.callee.object.type === "Identifier" &&
    argument.callee.object.name === "Promise" &&
    argument.callee.property.type === "Identifier" &&
    argument.callee.property.name === "all"
  );
};

// The awaited bindings a finalizer releases: the function it is handed whole, each function it calls, and each object
// It Calls a release method on
const getReleasedDeclarators = (finalizer: ESTree.Node, sourceCode: SourceCode): ESTree.VariableDeclarator[] => {
  const released = collectNodes(finalizer).flatMap((node): (ESTree.Node | undefined)[] => {
    if (node.type !== "CallExpression") return [];
    if (node.callee.type === "Identifier") return [node.callee];
    if (node.callee.type !== "MemberExpression" || node.callee.property.type !== "Identifier") return [];
    return RELEASE_METHODS.has(node.callee.property.name) ? [getRootIdentifier(node.callee.object)] : [];
  });
  if (finalizer.type === "Identifier") released.push(finalizer);
  return released.flatMap((identifier) => {
    const declarator = identifier && getAwaitedDeclarator(identifier, sourceCode);
    return declarator ? [declarator] : [];
  });
};

// Reports a finalizer that releases a binding an `await` made, when another `await` runs between the binding and the
// Finalizer: a rejection there never reaches the finalizer, so the binding is left open. See the error-handling skill.
export const noUnfinalizedResource: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    const awaits: { end: number; owner: ESTree.Node | null; start: number }[] = [];
    const finalizers: ESTree.CallExpression[] = [];
    return {
      AwaitExpression(node) {
        awaits.push({ end: node.end, owner: getEnclosingFunction(node), start: node.start });
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && FINALIZER_NAMES.has(node.callee.name) && node.arguments.length >= 2)
          finalizers.push(node);
      },
      "Program:exit"() {
        for (const guard of finalizers) {
          const [, finalizer] = guard.arguments;
          if (!finalizer) continue;
          const isUnfinalized = getReleasedDeclarators(finalizer, sourceCode).some((declarator) => {
            if (checkIsGathered(declarator)) return true;
            const owner = getEnclosingFunction(declarator);
            // An await that ends before the guard begins is the one that runs between: the guard's own `await` wraps
            // The guard, so it ends after it and is not counted
            return awaits.some(
              ({ end, owner: awaitOwner, start }) =>
                awaitOwner === owner && start > declarator.end && end <= guard.start,
            );
          });
          if (isUnfinalized) context.report({ message: UNFINALIZED_RESOURCE_MESSAGE, node: guard });
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
