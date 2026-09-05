import type { Context, ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the persist-then-notify standard (/docs/architecture/persist-then-notify).
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
// Expressions whose value is written out in place, so nothing already-started can be hiding behind them.
const LITERAL_NODE_TYPES = new Set([
  "ArrayExpression",
  "ArrowFunctionExpression",
  "Literal",
  "ObjectExpression",
  "TemplateLiteral",
]);
// A returned expression is only read as an effect when its promise-ness is certain from syntax alone: a `.then`
// Chain, or a `Promise.*` call. A plugin sees no types, so `return mapRoom(row)` and `return persist(row)` are the
// Same shape — and reporting the first would leave wrapping a pure transform in a best-effort handler as the only
// Way to silence the rule, which is the harm this standard exists to prevent. The cost is a returned bare promise
// Call going unflagged; a reviewer catches that, whereas noise trains everyone to silence the rule.
const getIsCertainPromiseExpression = (expression: ESTree.Expression): boolean =>
  expression.type === "CallExpression" &&
  expression.callee.type === "MemberExpression" &&
  expression.callee.property.type === "Identifier" &&
  (["catch", "finally", "then"].includes(expression.callee.property.name) ||
    (expression.callee.object.type === "Identifier" && expression.callee.object.name === "Promise"));
const FUNCTION_NODE_TYPES = new Set(["ArrowFunctionExpression", "FunctionDeclaration", "FunctionExpression"]);
// Everything a function reaches without crossing into a nested one; `select` decides what a node contributes,
// And returning a value stops the descent there. The two stop rules are what every caller needs held: a nested
// Function's body belongs to that function, not this one, and nodes carry a `parent` backreference that cycles.
const collectOwnNodes = <T>(value: unknown, select: (node: ESTree.Node) => T[] | undefined): T[] => {
  if (Array.isArray(value)) return value.flatMap((item) => collectOwnNodes(item, select));
  if (value === null || typeof value !== "object") return [];
  const node = value as ESTree.Node;
  if (typeof node.type !== "string" || FUNCTION_NODE_TYPES.has(node.type)) return [];
  const selected = select(node);
  if (selected) return selected;
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : collectOwnNodes(child, select)));
};
// Every value a block's promise can settle OR reject on: the arguments of its `return`s (what it resolves to,
// Which chains if a promise) and of its `await`s (what a rejection propagates from). A block with neither
// Settles on `undefined`, which never rejects — reading only the returns would miss a bare `await g(x)` in a
// Block body, deeming the whole fan-out safe
const getBlockEffects = (value: unknown): ESTree.Expression[] =>
  collectOwnNodes(value, (node) => {
    if (node.type === "ReturnStatement") return node.argument ? [node.argument] : [];
    else if (node.type === "AwaitExpression") return [node.argument];
    else return undefined;
  });
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
// A `throw` this function reaches without entering a nested one: one inside a deeper callback belongs to that
// Callback, not to this handler.
const getHasOwnThrow = (value: unknown): boolean =>
  collectOwnNodes(value, (node) => (node.type === "ThrowStatement" ? [true] : undefined)).length > 0;
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
// Unrecognised syntax falls through to `false`, which reports rather than exempts, so the shapes deliberately left
// Out (a ternary or `&&` chain in the await position, a `function` expression as the `.map` callback) cost a false
// Positive and never a miss — and none of them appear anywhere in `packages/app/server`, the only tree this rule
// Runs over. A false positive here is loud and immediate: it fails the lint on the line that wrote it. Widen this
// When one of those shapes actually lands, not before — every branch added is one the fixture suite has to pin.
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
    // `Promise.resolve` adopts what it is handed, so it rejects whenever that value is a rejecting promise. Only a
    // Literal is safe on sight: an identifier or member expression is the ordinary way to hold an already-started
    // Promise (`const deletion = client.deleteBlob(name); … await Promise.resolve(deletion)`), so blessing those
    // Would hand the rule's own defect a syntax that walks straight past it
    if (argument.callee.property.name === "resolve") {
      const [value] = argument.arguments;
      return value === undefined || LITERAL_NODE_TYPES.has(value.type);
    }
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
// The name a function is bound to, when it is bound to one rather than passed straight to a call: a closure holding
// An emit notifies nothing until that name is invoked, so the name is what carries the notify forward.
const getBoundFunctionName = (node: ESTree.Node): string | undefined => {
  if (node.type === "FunctionDeclaration") return node.id?.name;
  const { parent } = node;
  if (parent?.type === "VariableDeclarator" && parent.init === node && parent.id.type === "Identifier")
    return parent.id.name;
  else if (parent?.type === "AssignmentExpression" && parent.right === node && parent.left.type === "Identifier")
    return parent.left.name;
  return undefined;
};

const isEmitCall = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "MemberExpression" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "emit" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name.endsWith("EventEmitter");

const MESSAGE =
  "Unhandled effect after a notify (`emit`). Post-persist effects must be best-effort — wrap in getResultAsync(...).match(noop, console.error) — or move fatal work before the emit. See /docs/architecture/persist-then-notify.";

const rule = defineRule({
  create(context: Context) {
    // Per-function frame: the source position at which this function notifies, and the function node itself so a
    // Nested emit can be attributed to the call that runs the callback holding it.
    const functionStack: { emitStart?: number; node: ESTree.Node }[] = [];
    // Every function bound to a name, with the scope that binding lives in — the table `notify()` is resolved
    // Against. A name on its own is not a function: a sibling function's own `notify`, or one shadowing an outer
    // Notifying `notify`, is a different binding, and arming its caller reports every await that follows it — a
    // False error whose only cure is making a fatal write best-effort, the inversion this rule exists to prevent.
    const functionBindings: { isNotifying: boolean; name: string; node: ESTree.Node; scopeNode?: ESTree.Node }[] = [];
    const enterFunction = (node: ESTree.Node) => {
      const boundFunctionName = getBoundFunctionName(node);
      if (boundFunctionName !== undefined)
        functionBindings.push({
          isNotifying: false,
          name: boundFunctionName,
          node,
          scopeNode: functionStack.at(-1)?.node,
        });
      functionStack.push({ node });
    };
    const exitFunction = () => {
      functionStack.pop();
    };
    // The binding a name resolves to here: the innermost one whose scope is still open, exactly as the reader of
    // The call site resolves it. A scope not on the stack is closed — that binding is not this name.
    const getVisibleBinding = (name: string) => {
      let visibleBinding: (typeof functionBindings)[number] | undefined = undefined;
      let visibleDepth = -1;
      for (const binding of functionBindings) {
        if (binding.name !== name) continue;
        // Module scope (no enclosing function) is depth 0 and always visible; a frame's depth is its stack position
        const depth =
          binding.scopeNode === undefined
            ? 0
            : functionStack.findIndex((frame) => frame.node === binding.scopeNode) + 1;
        if (depth === 0 && binding.scopeNode !== undefined) continue;
        else if (depth >= visibleDepth) {
          visibleBinding = binding;
          visibleDepth = depth;
        }
      }
      return visibleBinding;
    };
    const getIsNotifyClosureCall = (callee: ESTree.Expression): boolean =>
      callee.type === "Identifier" && (getVisibleBinding(callee.name)?.isNotifying ?? false);
    // An emit inside a nested callback still notifies every function that RUNS that callback, so it arms the whole
    // Enclosing chain — otherwise wrapping the write+emit in `getResultAsync(async () => …)` hides the notify from
    // Every await that follows it. Each outer frame is armed at the position of the construct that runs the callback,
    // Never at the emit's own: the emit sits lexically before everything after that construct, so comparing raw
    // Positions would report a fatal await that runs BEFORE the notify — a false error whose only cure is wrapping a
    // Fatal write in a best-effort handler, the opposite of this standard. That position is the enclosing call when
    // The callback is passed straight to one, and otherwise the later call to the name it was bound to, which is why
    // The walk records the name and hands the rest to the CallExpression visitor rather than stopping outright.
    // Emits propagate outward only: a frame opened after the emit is a separate deferred body and stays unarmed
    const armFramesFrom = (start: number) => {
      let armStart = start;
      for (const frame of functionStack.toReversed()) {
        frame.emitStart ??= armStart;
        const { parent } = frame.node;
        if (parent?.type === "CallExpression" && parent.arguments.some((argument) => argument === frame.node)) {
          armStart = parent.start;
          continue;
        }
        // Marked on the binding itself, by identity — the name is only how a later call finds its way back here
        const notifyingBinding = functionBindings.find(({ node }) => node === frame.node);
        if (notifyingBinding) notifyingBinding.isNotifying = true;
        break;
      }
    };
    // Every effect the enclosing function can still reject on once it has notified: an `await`, the iterable of a
    // `for await`, and a returned promise, which rejects the awaiting caller exactly as an `await` would.
    const reportUnhandledEffect = (node: ESTree.Node, effect: ESTree.Expression) => {
      const frame = functionStack.at(-1);
      if (frame?.emitStart === undefined) return;
      // Before the notify — a fatal guard, not a tail effect
      else if (node.start < frame.emitStart) return;
      // Never rejects
      else if (isSafeAwait(effect)) return;
      context.report({ message: MESSAGE, node });
    };
    return {
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      AwaitExpression(node) {
        reportUnhandledEffect(node, node.argument);
      },
      CallExpression(node) {
        // An emit arms the function holding it, and a call to a closure that holds one arms the function making
        // That call — the two entry points are the same walk from a different starting position
        if (isEmitCall(node) || getIsNotifyClosureCall(node.callee)) armFramesFrom(node.start);
      },
      ForOfStatement(node) {
        // Only `for await`: a plain for-of settles on nothing
        if (node.await) reportUnhandledEffect(node, node.right);
      },
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      ReturnStatement(node) {
        if (node.argument && getIsCertainPromiseExpression(node.argument)) reportUnhandledEffect(node, node.argument);
      },
    };
  },
  meta: { type: "problem" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "persist-then-notify" },
  rules: { "no-unhandled-effect-after-emit": rule },
});

export default plugin;
