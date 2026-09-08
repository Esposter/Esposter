import { setupPluginSuite } from "#scripts/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

const RULE = "persist-then-notify/no-unhandled-effect-after-emit";

describe(RULE, () => {
  const FIXTURES = [
    // An exemption keyed off static AST containment cannot tell a later iteration from the very next line of
    // The same one, so it would exempt this — the core hazard.
    { name: "inLoopAfterEmit", source: `for (const x of xs) { aEventEmitter.emit(x); await g(x); }`, violations: 1 },
    // The batched-purge shape: the write is awaited before the emit, so the frame still has no emit when it
    // Is visited. This is why dropping the loop exemption costs the streaming case nothing.
    { name: "inLoopBeforeEmit", source: `for (const x of xs) { await g(x); aEventEmitter.emit(x); }`, violations: 0 },
    { name: "afterEmit", source: `aEventEmitter.emit(); await g();`, violations: 1 },
    { name: "beforeEmit", source: `await g(); aEventEmitter.emit();`, violations: 0 },
    { name: "safeWrapperAfterEmit", source: `aEventEmitter.emit(); await getResultAsync(g);`, violations: 0 },
    {
      name: "promiseAllOverSafeMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => createSystemRoomMessage(x)));`,
      violations: 0,
    },
    {
      name: "promiseAllOverUnsafeMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => g(x)));`,
      violations: 1,
    },
    // `Promise.allSettled` never rejects regardless of its elements, so any fan-out under it is best-effort.
    {
      name: "promiseAllSettledOverUnsafeMap",
      source: `aEventEmitter.emit(); await Promise.allSettled(xs.map((x) => g(x)));`,
      violations: 0,
    },
    // A block body settles on what it returns, so the check reads the returns rather than giving up on the block.
    {
      name: "promiseAllOverSafeBlockBodyMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => { const y = f(x); return getResultAsync(() => g(y)); }));`,
      violations: 0,
    },
    {
      name: "promiseAllOverUnsafeBlockBodyMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => { return g(x); }));`,
      violations: 1,
    },
    // A block body with no return still rejects if one of its awaits does, so the check reads the awaits too —
    // Not only the returns, or a bare `await g(x)` fan-out would slip through as vacuously safe.
    {
      name: "promiseAllOverAwaitingBlockBodyMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map(async (x) => { await g(x); }));`,
      violations: 1,
    },
    {
      name: "promiseAllOverSafeAwaitingBlockBodyMap",
      source: `aEventEmitter.emit(); await Promise.all(xs.map(async (x) => { await getResultAsync(() => g(x)); }));`,
      violations: 0,
    },
    // The emit is the innermost frame's, but it still notifies for the function that awaits that frame.
    {
      name: "emitInNestedCallback",
      source: `await getResultAsync(async () => { await p(); aEventEmitter.emit(); }); await g();`,
      violations: 1,
    },
    // A nested function opens its own frame, so the outer emit does not reach into it.
    { name: "nestedFunction", source: `aEventEmitter.emit(); return async () => { await g(); };`, violations: 0 },
    // A closure that only holds an emit has notified nothing until it is CALLED, so the await between its
    // Declaration and that call is a fatal guard. Attributing the emit to the closure's own source position would
    // Report it, and the only way to satisfy that report is to make a fatal write best-effort.
    {
      name: "declaredNotifyCalledAfterAwait",
      source: `const notify = () => { aEventEmitter.emit(); }; await g(); notify();`,
      violations: 0,
    },
    // …but once that closure is CALLED the notify has happened, so everything after it is a tail effect again.
    // Exempting the await before the call must not exempt the awaits after it.
    {
      name: "declaredNotifyCalledBeforeAwait",
      source: `const notify = () => { aEventEmitter.emit(); }; await g(); notify(); await h();`,
      violations: 1,
    },
    {
      name: "declaredNotifySafeAwaitAfterCall",
      source: `const notify = () => { aEventEmitter.emit(); }; notify(); await getResultAsync(h);`,
      violations: 0,
    },
    // A name is not the function. A sibling function's own `notify` is a different binding, and arming the caller
    // Of that one reports every await after it — a false error whose only cure is making a fatal write best-effort.
    {
      name: "siblingSameNameNotifyDoesNotArm",
      source: `const a = async () => { const notify = () => { aEventEmitter.emit(); }; notify(); }; const b = async () => { const notify = () => { h(); }; notify(); await g(); }; await b(); await a();`,
      violations: 0,
    },
    // Shadowing resolves the same way: the inner binding is the one the call reaches, so the outer notifying one
    // Says nothing about it.
    {
      name: "shadowingSameNameNotifyDoesNotArm",
      source: `const notify = () => { aEventEmitter.emit(); }; const b = async () => { const notify = () => { h(); }; notify(); await g(); }; await b(); notify();`,
      violations: 0,
    },
    // `for await` rejects the caller exactly as an `await` does — the batched-purge loop that keeps pulling pages
    // After emitting for the first one is the shape this catches.
    {
      name: "forAwaitAfterEmit",
      source: `aEventEmitter.emit(); for await (const x of xs) { h(x); }`,
      violations: 1,
    },
    { name: "forAwaitBeforeEmit", source: `for await (const x of xs) { h(x); } aEventEmitter.emit();`, violations: 0 },
    // A returned promise rejects the awaiting caller identically to an awaited one — but only where syntax proves it
    // Is one. A plugin sees no types, so a returned bare call is left alone: reporting `return mapRow(row)` would
    // Make wrapping a pure transform in a best-effort handler the only way to silence the rule.
    { name: "returnThenChainAfterEmit", source: `aEventEmitter.emit(); return g().then(noop);`, violations: 1 },
    {
      name: "returnPromiseAllAfterEmit",
      source: `aEventEmitter.emit(); return Promise.all(xs.map((x) => g(x)));`,
      violations: 1,
    },
    { name: "returnBareCallAfterEmit", source: `aEventEmitter.emit(); return mapRow(row);`, violations: 0 },
    // A returned value is not an effect: it cannot reject, and every mutation returns its entity after notifying.
    { name: "returnValueAfterEmit", source: `aEventEmitter.emit(); return entity;`, violations: 0 },
    // `Promise.resolve` adopts what it is handed — nothing, here, so there is nothing to reject.
    {
      name: "returnResolvedPromiseAfterEmit",
      source: `aEventEmitter.emit(); return Promise.resolve();`,
      violations: 0,
    },
    // An identifier is the ordinary way to hold an already-started promise, so it cannot be blessed on sight.
    {
      name: "awaitResolvedIdentifierAfterEmit",
      source: `const deletion = client.deleteBlob(name); aEventEmitter.emit(); await Promise.resolve(deletion);`,
      violations: 1,
    },
    {
      name: "awaitResolvedLiteralAfterEmit",
      source: `aEventEmitter.emit(); await Promise.resolve("");`,
      violations: 0,
    },
    // Only a `*EventEmitter` receiver carries the persist-then-notify meaning.
    { name: "nonEmitterEmit", source: `analytics.emit(); await g();`, violations: 0 },
    // The root only says the chain STARTED in a wrapper. A terminal that rethrows hands the rejection straight
    // Back to the caller, and rethrowing from the err branch is a documented repo idiom — so these are the exact
    // Shape the rule exists to catch, written the way the codebase actually writes it.
    {
      name: "rethrowingMatchAfterEmit",
      source: `aEventEmitter.emit(); await getResultAsync(g).match(noop, (error) => { throw error; });`,
      violations: 1,
    },
    {
      name: "rethrowingHelperMatchAfterEmit",
      source: `aEventEmitter.emit(); await getResultAsync(g).match(noop, logAndRethrow(context, name));`,
      violations: 1,
    },
    {
      name: "absorbingMatchAfterEmit",
      source: `aEventEmitter.emit(); await getResultAsync(g).match(noop, console.error);`,
      violations: 0,
    },
    // A throw inside a deeper callback belongs to that callback, not to the err handler.
    {
      name: "nestedThrowInMatchAfterEmit",
      source: `aEventEmitter.emit(); await getResultAsync(g).match(noop, () => { xs.forEach(() => { throw e; }); });`,
      violations: 0,
    },
    {
      name: "unsafeUnwrapAfterEmit",
      source: `aEventEmitter.emit(); await getResultAsync(g)._unsafeUnwrap();`,
      violations: 1,
    },
    // Both finalizers unwrap the original result and rethrow on Err, so awaiting one after an emit rejects the
    // Caller for an entity that already exists and was already broadcast.
    {
      name: "withFinalizerAsyncAfterEmit",
      source: `aEventEmitter.emit(); await withFinalizerAsync(() => g(), () => h());`,
      violations: 1,
    },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "persistThenNotify",
    rules: [RULE],
    wrapSource: (source) => `export const f = async () => { ${source} };`,
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())]).toStrictEqual(["persist-then-notify(no-unhandled-effect-after-emit)"]);
  });
});
