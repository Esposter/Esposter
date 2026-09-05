import type { ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the "an extraction earns its existence" rule (file-organization/SKILL.md).
//
// An exported arrow whose whole body is one call passing exactly its own parameters, in order, adding nothing,
// Is a rename with an import: the caller still hand-writes every argument, so forgetting one is exactly as easy
// As it was inline. The check is purely syntactic and runs in oxlint's single root pass.
//
// What it deliberately cannot see is why a wrapper is kept, so three shapes are exempted here rather than
// Reported and disabled everywhere they occur:
//
// - A member call on an UPPER_SNAKE object (`UUIDV4_REGEX.test(uuid)`) supplies the constant its callers would
//   Otherwise restate, which is the textbook earned extraction.
// - A parameter with a default (`(a, b = X) => f(a, b)`) supplies that default.
// - A non-identifier argument — a literal, an `as`, an arrow, a member access — is something the caller did not
//   Hand over, so the wrapper is absorbing at least that much.
//
// Everything left over is reported, and the repo carries no production suppression for it: a narrowed parameter
// Type, a "single definition point" several reads agree on and an upstream API name were each considered and
// Rejected as reasons to keep a wrapper, so the rule is the convention rather than a default to argue with.
//
// It is off for `*.test.ts`/`*.bench.ts` (root .oxlintrc.json, which takes no comments): a colocated module
// Double exists precisely to mirror the real signature, so forwarding is the whole point there.
const MESSAGE =
  "Forwarding wrapper: every argument is still hand-written at the call site, so this only renames the callee. Inline it, or give it something to absorb — a constant, a narrowing, or a definition several call sites must agree on.";
const UPPER_SNAKE_REGEX = /^[A-Z0-9_]+$/u;
// The name a parameter binds, or undefined for a pattern/default — both mean the wrapper is doing more than
// Forwarding, so an undefined here stops the check rather than failing it.
const getParameterName = (parameter: ESTree.Node): string | undefined => {
  if (parameter.type === "Identifier") return parameter.name;
  else if (parameter.type === "RestElement" && parameter.argument.type === "Identifier") return parameter.argument.name;
  else return undefined;
};
// The name an argument forwards, or undefined for anything the caller did not simply hand over.
const getArgumentName = (argument: ESTree.Node): string | undefined => {
  if (argument.type === "Identifier") return argument.name;
  else if (argument.type === "SpreadElement" && argument.argument.type === "Identifier") return argument.argument.name;
  else return undefined;
};
// The receiver a member call dispatches on, when it is a bare identifier: `client.deleteEntity(...)` -> `client`.
const getReceiverName = (expression: ESTree.CallExpression | ESTree.NewExpression): string | undefined => {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") return undefined;
  const { object } = expression.callee;
  return object.type === "Identifier" ? object.name : undefined;
};

const rule = defineRule({
  create(context) {
    const getIsForwardingCall = (
      parameterNames: string[],
      expression: ESTree.CallExpression | ESTree.NewExpression,
    ): boolean => {
      const receiverName = getReceiverName(expression);
      // A member call is only a forward when the receiver came from the caller too; on anything else the wrapper
      // Is supplying the object, and an UPPER_SNAKE one is supplying a constant outright
      if (expression.type === "CallExpression" && expression.callee.type === "MemberExpression") {
        if (receiverName === undefined || UPPER_SNAKE_REGEX.test(receiverName)) return false;
      } else if (expression.callee.type !== "Identifier") return false;
      const expectedNames = receiverName === parameterNames[0] ? parameterNames.slice(1) : parameterNames;
      const argumentNames = expression.arguments.map((argument) => getArgumentName(argument));
      if (argumentNames.length !== expectedNames.length) return false;
      return argumentNames.every((argumentName, index) => argumentName === expectedNames[index]);
    };
    // A read of what a forward would have returned is the same rename one step further out:
    // `() => useVTheme().global` and `(a) => a.b` both hand back a property the caller could have reached
    // Itself.
    const getIsForwardingRead = (parameterNames: string[], expression: ESTree.MemberExpression): boolean => {
      if (expression.computed) return false;
      const { object } = expression;
      if (object.type === "Identifier") return parameterNames.includes(object.name);
      else if (object.type === "CallExpression" || object.type === "NewExpression")
        return getIsForwardingCall(parameterNames, object);
      else return false;
    };
    // An exported arrow reaches the surface either named or as the module's default, and the two shapes forward
    // Identically, so both visitors hand their arrow here.
    const reportIfForwarding = (arrow: ESTree.ArrowFunctionExpression): void => {
      const parameterNames = arrow.params.map((parameter) => getParameterName(parameter));
      if (parameterNames.some((parameterName) => parameterName === undefined)) return;
      const names = parameterNames as string[];
      // `async (a) => await f(a)` forwards exactly as its sync twin does
      const body = arrow.body.type === "AwaitExpression" ? arrow.body.argument : arrow.body;
      const isForwarding =
        body.type === "MemberExpression"
          ? getIsForwardingRead(names, body)
          : (body.type === "CallExpression" || body.type === "NewExpression") && getIsForwardingCall(names, body);
      if (isForwarding) context.report({ message: MESSAGE, node: arrow });
    };
    return {
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === "ArrowFunctionExpression") reportIfForwarding(node.declaration);
      },
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== "VariableDeclaration") return;
        for (const { init } of node.declaration.declarations)
          if (init?.type === "ArrowFunctionExpression") reportIfForwarding(init);
      },
    };
  },
  meta: { type: "suggestion" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "pass-through-helper" },
  rules: { "no-forwarding-wrapper": rule },
});

export default plugin;
