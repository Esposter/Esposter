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

// Calls that never reject: the neverthrow wrappers, plus helpers that wrap their own effect
// Best-effort internally (so awaiting them never rejects). `withFinalizer`/`withFinalizerAsync` are deliberately
// NOT here — both unwrap the original result and rethrow on Err (see error-handling/SKILL.md, Finalizers), so
// Awaiting one after an emit rejects the caller for an entity that already exists and was already broadcast.
const ALLOWED_ROOTS = new Set([
  "createSystemRoomMessage",
  "getResult",
  "getResultAsync",
  "publishBlobDeletion",
  "publishBlobPrefixDeletion",
]);
// Terminal helpers whose whole job is to log and put the rejection back.
const RETHROWING_CALLEES = new Set(["logAndRethrow"]);
const PROMISE_COMBINATORS = new Set(["all", "any", "race"]);
const FUNCTION_NODE_TYPES = new Set(["ArrowFunctionExpression", "FunctionDeclaration", "FunctionExpression"]);
// Every value a block's promise can settle OR reject on without crossing into a nested function: the
// Arguments of its `return`s (what it resolves to, which chains if a promise) and of its `await`s (what a
// Rejection propagates from). A block with neither settles on `undefined`, which never rejects — reading
// Only the returns would miss a bare `await g(x)` in a block body, deeming the whole fan-out safe
const getBlockEffects = (value: unknown): ESTree.Expression[] => {
  if (Array.isArray(value)) return value.flatMap((item) => getBlockEffects(item));
  if (value === null || typeof value !== "object") return [];
  const node = value as ESTree.Node;
  if (typeof node.type !== "string" || FUNCTION_NODE_TYPES.has(node.type)) return [];
  if (node.type === "ReturnStatement") return node.argument ? [node.argument] : [];
  if (node.type === "AwaitExpression") return [node.argument];
  // Nodes carry a `parent` backreference, so walking every value would cycle
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : getBlockEffects(child)));
};
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
// A `throw` this function reaches without entering a nested one — the same walk shape as getBlockEffects, and
// Nested for the same reason: a throw inside a deeper callback belongs to that callback, not to this handler.
const getHasOwnThrow = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some((item) => getHasOwnThrow(item));
  if (value === null || typeof value !== "object") return false;
  const node = value as ESTree.Node;
  if (typeof node.type !== "string" || FUNCTION_NODE_TYPES.has(node.type)) return false;
  if (node.type === "ThrowStatement") return true;
  return Object.entries(node).some(([key, child]) => key !== "parent" && getHasOwnThrow(child));
};
// An err handler that puts the rejection back rather than absorbing it.
const getIsRethrowingHandler = (node: unknown): boolean => {
  if (node === null || typeof node !== "object") return false;
  const expression = node as ESTree.Node;
  if (expression.type === "Identifier") return RETHROWING_CALLEES.has(expression.name);
  if (expression.type === "CallExpression")
    return expression.callee.type === "Identifier" && RETHROWING_CALLEES.has(expression.callee.name);
  if (!FUNCTION_NODE_TYPES.has(expression.type)) return false;
  return getHasOwnThrow((expression as ESTree.ArrowFunctionExpression).body);
};
// The root says the chain STARTED in a wrapper; it says nothing about how the chain ENDS. `.match(noop, (error)
// => { throw error })` and `._unsafeUnwrap()` both hand the rejection straight back to the awaiting caller, and
// Rethrowing from the err branch is a documented repo idiom — so the terminal has to be read, not assumed.
const getHasRethrowingTerminal = (expression: ESTree.Expression): boolean => {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") return false;
  const { callee } = expression;
  if (callee.property.type === "Identifier") {
    if (callee.property.name === "_unsafeUnwrap") return true;
    const [, errorHandler] = expression.arguments;
    if (callee.property.name === "match" && getIsRethrowingHandler(errorHandler)) return true;
  }
  return getHasRethrowingTerminal(callee.object);
};
// Never rejects: an allowed wrapper whose terminal absorbs the error, `Promise.allSettled` over anything, or a
// Rejecting Promise combinator over a fan-out (array literal or `.map` callback) of such calls — e.g.
// `Promise.all(users.map((u) => createSystemRoomMessage(u)))`.
const isSafeAwait = (argument: ESTree.Expression): boolean => {
  const rootName = rootCalleeName(argument);
  if (rootName !== undefined && ALLOWED_ROOTS.has(rootName)) return !getHasRethrowingTerminal(argument);
  if (
    argument.type === "CallExpression" &&
    argument.callee.type === "MemberExpression" &&
    argument.callee.object.type === "Identifier" &&
    argument.callee.object.name === "Promise" &&
    argument.callee.property.type === "Identifier"
  ) {
    // `Promise.allSettled` resolves an array of outcomes and never rejects regardless of its elements
    if (argument.callee.property.name === "allSettled") return true;
    if (!PROMISE_COMBINATORS.has(argument.callee.property.name)) return false;
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
        return callback.body.type === "BlockStatement"
          ? getBlockEffects(callback.body).every((effect) => isSafeAwait(effect))
          : isSafeAwait(callback.body);
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
        // An emit inside a nested callback still notifies every function that runs it, so it arms the whole
        // Enclosing chain — otherwise wrapping the write+emit in `getResultAsync(async () => …)` hides the
        // Notify from every await that follows it. Emits propagate outward only: a frame opened after the
        // Emit (the `nestedFunction` case) is a separate deferred body and stays unarmed
        for (const frame of functionStack) if (!frame.emit) frame.emit = node;
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
