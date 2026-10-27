import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("persistThenNotify", () => {
  const EMITTER = "EventEmitter";
  const EMIT = "emit";
  const SAFE_WRAPPER = "getResultAsync";
  const TERMINAL = "match";
  const RETHROW = "logAndRethrow";
  const MAP = "map";
  const THEN = "then";
  const FAN_OUT = "Promise.all";
  const FAN_OUT_SETTLED = "Promise.allSettled";
  const RESOLVE = "Promise.resolve";
  const REJECT = "Promise.reject";
  const RULE = "persist-then-notify/no-unhandled-effect-after-emit";
  const FIXTURES = [
    // An exemption keyed off static AST containment cannot tell a later iteration from the very next line of
    // The same one, so it would exempt this — the core hazard.
    { name: "inLoopAfterEmit", source: `for (const x of xs) { a${EMITTER}.${EMIT}(x); await g(x); }`, violations: 1 },
    // The batched-purge shape: the write is awaited before the emit, so the frame still has no emit when it
    // Is visited. This is why dropping the loop exemption costs the streaming case nothing.
    { name: "inLoopBeforeEmit", source: `for (const x of xs) { await g(x); a${EMITTER}.${EMIT}(x); }`, violations: 0 },
    { name: "afterEmit", source: `a${EMITTER}.${EMIT}(); await g();`, violations: 1 },
    { name: "beforeEmit", source: `await g(); a${EMITTER}.${EMIT}();`, violations: 0 },
    { name: "safeWrapperAfterEmit", source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g);`, violations: 0 },
    // A helper that hands back its ResultAsync is told apart from a fatal one by the terminal the call site
    // Writes, never by its name — so bare it reports, and terminated it passes, whatever it is called.
    { name: "bareHelperAfterEmit", source: `a${EMITTER}.${EMIT}(); await g(x);`, violations: 1 },
    {
      name: "absorbingMatchOnHelperAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await g(x).${TERMINAL}(h, console.error);`,
      violations: 0,
    },
    {
      name: "conciselyRethrowingMatchOnHelperAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await g(x).${TERMINAL}(h, (a) => ${RETHROW}(a));`,
      violations: 1,
    },
    {
      name: "rethrowingMatchOnHelperAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await g(x).${TERMINAL}(h, (a) => { throw a; });`,
      violations: 1,
    },
    {
      name: "promiseAllOverSafeMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}((x) => g(x).${TERMINAL}(h, console.error)));`,
      violations: 0,
    },
    {
      name: "promiseAllOverUnsafeMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}((x) => g(x)));`,
      violations: 1,
    },
    // `Promise.allSettled` never rejects regardless of its elements, so any fan-out under it is best-effort.
    {
      name: "promiseAllSettledOverUnsafeMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT_SETTLED}(xs.${MAP}((x) => g(x)));`,
      violations: 0,
    },
    // A block body settles on what it returns, so the check reads the returns rather than giving up on the block.
    {
      name: "promiseAllOverSafeBlockBodyMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}((x) => { const y = f(x); return ${SAFE_WRAPPER}(() => g(y)); }));`,
      violations: 0,
    },
    {
      name: "promiseAllOverUnsafeBlockBodyMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}((x) => { return g(x); }));`,
      violations: 1,
    },
    // A block body with no return still rejects if one of its awaits does, so the check reads the awaits too —
    // Not only the returns, or a bare `await g(x)` fan-out would slip through as vacuously safe.
    {
      name: "promiseAllOverAwaitingBlockBodyMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}(async (x) => { await g(x); }));`,
      violations: 1,
    },
    {
      name: "promiseAllOverSafeAwaitingBlockBodyMap",
      source: `a${EMITTER}.${EMIT}(); await ${FAN_OUT}(xs.${MAP}(async (x) => { await ${SAFE_WRAPPER}(() => g(x)); }));`,
      violations: 0,
    },
    // The emit is the innermost frame's, but it still notifies for the function that awaits that frame.
    {
      name: "emitInNestedCallback",
      source: `await ${SAFE_WRAPPER}(async () => { await p(); a${EMITTER}.${EMIT}(); }); await g();`,
      violations: 1,
    },
    // A nested function opens its own frame, so the outer emit does not reach into it.
    { name: "nestedFunction", source: `a${EMITTER}.${EMIT}(); return async () => { await g(); };`, violations: 0 },
    // A closure that only holds an emit has notified nothing until it is CALLED, so the await between its
    // Declaration and that call is a fatal guard. Attributing the emit to the closure's own source position would
    // Report it, and the only way to satisfy that report is to make a fatal write best-effort.
    {
      name: "declaredNotifyCalledAfterAwait",
      source: `const f = () => { a${EMITTER}.${EMIT}(); }; await g(); f();`,
      violations: 0,
    },
    // …but once that closure is CALLED the notify has happened, so everything after it is a tail effect again.
    // Exempting the await before the call must not exempt the awaits after it.
    {
      name: "declaredNotifyCalledBeforeAwait",
      source: `const f = () => { a${EMITTER}.${EMIT}(); }; await g(); f(); await h();`,
      violations: 1,
    },
    {
      name: "declaredNotifySafeAwaitAfterCall",
      source: `const f = () => { a${EMITTER}.${EMIT}(); }; f(); await ${SAFE_WRAPPER}(h);`,
      violations: 0,
    },
    // A name is not the function. A sibling function's own `notify` is a different binding, and arming the caller
    // Of that one reports every await after it — a false error whose only cure is making a fatal write best-effort.
    {
      name: "siblingSameNameNotifyDoesNotArm",
      source: `const a = async () => { const f = () => { a${EMITTER}.${EMIT}(); }; f(); }; const b = async () => { const f = () => { h(); }; f(); await g(); }; await b(); await a();`,
      violations: 0,
    },
    // Shadowing resolves the same way: the inner binding is the one the call reaches, so the outer notifying one
    // Says nothing about it.
    {
      name: "shadowingSameNameNotifyDoesNotArm",
      source: `const f = () => { a${EMITTER}.${EMIT}(); }; const b = async () => { const f = () => { h(); }; f(); await g(); }; await b(); f();`,
      violations: 0,
    },
    // `for await` rejects the caller exactly as an `await` does — the batched-purge loop that keeps pulling pages
    // After emitting for the first one is the shape this catches.
    { name: "forAwaitAfterEmit", source: `a${EMITTER}.${EMIT}(); for await (const x of xs) { h(x); }`, violations: 1 },
    { name: "forAwaitBeforeEmit", source: `for await (const x of xs) { h(x); } a${EMITTER}.${EMIT}();`, violations: 0 },
    // A returned promise rejects the awaiting caller identically to an awaited one — but only where syntax proves it
    // Is one. A plugin sees no types, so a returned bare call is left alone: reporting `return mapRow(row)` would
    // Make wrapping a pure transform in a best-effort handler the only way to silence the rule.
    { name: "returnThenChainAfterEmit", source: `a${EMITTER}.${EMIT}(); return g().${THEN}(h);`, violations: 1 },
    {
      name: "returnPromiseAllAfterEmit",
      source: `a${EMITTER}.${EMIT}(); return ${FAN_OUT}(xs.${MAP}((x) => g(x)));`,
      violations: 1,
    },
    { name: "returnBareCallAfterEmit", source: `a${EMITTER}.${EMIT}(); return f(a);`, violations: 0 },
    // A returned value is not an effect: it cannot reject, and every mutation returns its entity after notifying.
    { name: "returnValueAfterEmit", source: `a${EMITTER}.${EMIT}(); return a;`, violations: 0 },
    // `Promise.resolve` adopts what it is handed — nothing, here, so there is nothing to reject.
    { name: "returnResolvedPromiseAfterEmit", source: `a${EMITTER}.${EMIT}(); return ${RESOLVE}();`, violations: 0 },
    // An identifier is the ordinary way to hold an already-started promise, so it cannot be blessed on sight.
    {
      name: "awaitResolvedIdentifierAfterEmit",
      source: `const x = b.a(c); a${EMITTER}.${EMIT}(); await ${RESOLVE}(x);`,
      violations: 1,
    },
    { name: "awaitResolvedLiteralAfterEmit", source: `a${EMITTER}.${EMIT}(); await ${RESOLVE}("");`, violations: 0 },
    // Only a `*EventEmitter` receiver carries the persist-then-notify meaning.
    { name: "nonEmitterEmit", source: `b.${EMIT}(); await g();`, violations: 0 },
    // The root only says the chain STARTED in a wrapper. A terminal that rethrows hands the rejection straight
    // Back to the caller, and rethrowing from the err branch is a documented repo idiom — so these are the exact
    // Shape the rule exists to catch, written the way the codebase actually writes it.
    {
      name: "rethrowingMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, (a) => { throw a; });`,
      violations: 1,
    },
    {
      name: "rethrowingHelperMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, ${RETHROW}(b, c));`,
      violations: 1,
    },
    {
      name: "rethrowingPromiseRejectMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, (a) => ${REJECT}(a));`,
      violations: 1,
    },
    {
      name: "rethrowingPromiseRejectBlockMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, (a) => { return ${REJECT}(a); });`,
      violations: 1,
    },
    {
      name: "rethrowingPromiseRejectHandlerMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, ${REJECT});`,
      violations: 1,
    },
    {
      name: "absorbingMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, console.error);`,
      violations: 0,
    },
    // A throw inside a deeper callback belongs to that callback, not to the err handler.
    {
      name: "nestedThrowInMatchAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await ${SAFE_WRAPPER}(g).${TERMINAL}(h, () => { xs.forEach(() => { throw e; }); });`,
      violations: 0,
    },
    // Both finalizers unwrap the original result and rethrow on Err, so awaiting one after an emit rejects the
    // Caller for an entity that already exists and was already broadcast.
    {
      name: "withFinalizerAsyncAfterEmit",
      source: `a${EMITTER}.${EMIT}(); await f(() => g(), () => h());`,
      violations: 1,
    },
  ];
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "persistThenNotify",
    rules: [RULE],
    wrapSource: (source) => `export const f = async () => { ${source} };`,
  });
});
