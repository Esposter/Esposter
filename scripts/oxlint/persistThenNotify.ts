import type { Context, ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// Oxlint JS plugin enforcing the persist-then-notify standard (/docs/architecture/persist-then-notify).
//
// Once a function fires a realtime notify (`<name>EventEmitter.emit(...)`), the entity exists and the
// Caller's outcome is decided — so every later `await` must be best-effort (never rejects) or the fatal
// Work must move before the emit. The check is purely syntactic, so it runs in oxlint's single root pass.
//
// Scoped to packages/app/server in the root .oxlintrc.json: only there does an emitter carry the
// Persist-then-notify meaning. Client emitters (e.g. the Phaser game bus) are a different concept.

// Calls that never reject: the neverthrow wrappers, plus helpers that wrap their own write+emit
// Best-effort internally (so awaiting them never rejects).
const ALLOWED_ROOTS = new Set([
  "createSystemRoomMessage",
  "getResult",
  "getResultAsync",
  "withFinalizer",
  "withFinalizerAsync",
]);
const PROMISE_COMBINATORS = new Set(["all", "allSettled", "any", "race"]);
// The identifier a call chain ultimately dispatches on: `getResultAsync(...).orTee(...).unwrapOr(...)`
// Roots at `getResultAsync`; `containerClient.deleteBlob(...)` roots at nothing nameable (undefined).
const rootCalleeName = (expression: ESTree.Expression): string | undefined => {
  if (expression.type === "CallExpression") {
    if (expression.callee.type === "Identifier") return expression.callee.name;
    if (expression.callee.type === "MemberExpression") return rootCalleeName(expression.callee.object);
    return undefined;
  }
  if (expression.type === "MemberExpression") return rootCalleeName(expression.object);
  return undefined;
};
// Never rejects: an allowed wrapper, or a Promise combinator over a fan-out (array literal or `.map`
// Callback) of such calls — e.g. `Promise.all(users.map((u) => createSystemRoomMessage(u)))`.
const isSafeAwait = (argument: ESTree.Expression): boolean => {
  const rootName = rootCalleeName(argument);
  if (rootName !== undefined && ALLOWED_ROOTS.has(rootName)) return true;
  if (
    argument.type === "CallExpression" &&
    argument.callee.type === "MemberExpression" &&
    argument.callee.object.type === "Identifier" &&
    argument.callee.object.name === "Promise" &&
    argument.callee.property.type === "Identifier" &&
    PROMISE_COMBINATORS.has(argument.callee.property.name)
  ) {
    const [collection] = argument.arguments;
    if (collection?.type === "ArrayExpression")
      return collection.elements.every(
        (element) => element !== null && element.type !== "SpreadElement" && isSafeAwait(element),
      );
    if (
      collection?.type === "CallExpression" &&
      collection.callee.type === "MemberExpression" &&
      collection.callee.property.type === "Identifier" &&
      collection.callee.property.name === "map"
    ) {
      const [callback] = collection.arguments;
      if (callback?.type === "ArrowFunctionExpression")
        return callback.body.type === "BlockStatement" ? false : isSafeAwait(callback.body);
    }
  }
  return false;
};

const isEmitCall = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "MemberExpression" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "emit" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name.endsWith("EventEmitter");

const rule = defineRule({
  create(context: Context) {
    // Per-function frame: the first emit seen. Every later await must be best-effort.
    const functionStack: { emit?: ESTree.CallExpression }[] = [];
    const enterFunction = () => {
      functionStack.push({});
    };
    const exitFunction = () => {
      functionStack.pop();
    };
    return {
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      AwaitExpression(node) {
        const frame = functionStack.at(-1);
        if (!frame?.emit) return;
        // Before the emit — a fatal guard, not a tail effect
        if (node.start < frame.emit.start) return;
        // Never rejects
        if (isSafeAwait(node.argument)) return;
        context.report({
          message:
            "Unhandled `await` after a notify (`emit`). Post-persist effects must be best-effort — wrap in getResultAsync(...).match(noop, console.error) — or move fatal work before the emit. See /docs/architecture/persist-then-notify.",
          node,
        });
      },
      CallExpression(node) {
        if (!isEmitCall(node)) return;
        const frame = functionStack.at(-1);
        if (frame && !frame.emit) frame.emit = node;
      },
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
    };
  },
  meta: { type: "problem" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "persist-then-notify" },
  rules: { "no-unhandled-effect-after-emit": rule },
});

export default plugin;
