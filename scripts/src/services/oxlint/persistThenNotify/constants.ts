export const MESSAGE =
  "Unhandled effect after a notify (`emit`). Post-persist effects must be best-effort — wrap in getResultAsync(...).match(noop, console.error) — or move fatal work before the emit. See /docs/architecture/persist-then-notify.";
// Calls that never reject: the neverthrow wrappers, and nothing of the repo's own. A helper that is best-effort
// Inside cannot be told from a fatal one at its call site, so such a helper hands its ResultAsync back and the
// Call site terminates it — which is the `.match` terminal `checkHasAbsorbingMatchTerminal` reads, and needs no
// List of helper names to stay correct (oxlint skill, custom-js-plugins). `withFinalizer`/`withFinalizerAsync`
// Are deliberately NOT here — both unwrap the original result and rethrow on Err (see error-handling/SKILL.md,
// Finalizers), so awaiting one after an emit rejects the caller for an entity that already exists and was
// Already broadcast.
export const AllowedRoots: ReadonlySet<string> = new Set(["getResult", "getResultAsync"]);
// Terminal helpers whose whole job is to log and put the rejection back.
export const RethrowingCallees: ReadonlySet<string> = new Set(["logAndRethrow"]);

export const PromiseCombinators: ReadonlySet<string> = new Set(["all", "any", "race"]);
// Expressions whose value is written out in place, so nothing already-started can be hiding behind them.
export const LiteralNodeTypes: ReadonlySet<string> = new Set([
  "ArrayExpression",
  "ArrowFunctionExpression",
  "Literal",
  "ObjectExpression",
  "TemplateLiteral",
]);

export const FunctionNodeTypes: ReadonlySet<string> = new Set([
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
]);
