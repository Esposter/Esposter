# Testing

Every test-file convention the `testing` skill owns, carried across the suites written before each was written
down. Standing: a unit's date says the rules below all held there on that date, and the pass resumes from the
files changed since.

## Rules

| Rule                                                       | Owner                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| A test earns its line or is deleted; fixtures written once | `testing` — "What to Test"                              |
| Canonical values; every date computed from the epoch       | `test-values`                                           |
| Constants inside the `describe`, never module scope        | enforced: `scripts/src/workspace/constantScope.test.ts` |
| Mock cleanup follows how the mock was created              | `testing` — `references/module-mocks.md`                |
| `expect.hasAssertions()`, exact assertions, no polling     | `testing` — "Assertions"                                |
| The cheapest environment that runs the file (`app` only)   | this ledger — "The environment a suite declares"        |

A bare zero-argument `vi.fn` is not in this table because
`packages/configuration/eslint/restrictedTestSyntaxes.js` fails on the line that writes it.

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state. The environment row is the one exception, and only because
its scope is narrower than the ledger's: `apps/web` is the sole package whose vitest config offers a choice
of environment, so the rule cannot fail anywhere else and the rows outside it keep their dates.

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping.

| Area                      | What it holds                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | the chrome, the routes, and the cross-cutting service, composable and store layers |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and routers               |
| [resource](resource.md)   | the resource explorer, the sheet editor and the other editors                      |
| [products](products.md)   | the smaller products — posts, the clicker, achievements                            |
| [dungeons](dungeons.md)   | the game                                                                           |
| [server](server.md)       | `apps/web/server` — routers, procedure builders, guards and services               |
| [shared](shared.md)       | `apps/web/shared` and `app/components/Styled` — what both halves of the app read   |
| [packages](packages.md)   | every workspace package outside `apps/web`                                         |
| [tooling](tooling.md)     | `scripts/`, `.agents/`, the app's root config suites and `content/`                |

The area names are [quality](../quality/)'s, so "was this area swept, for which question, and when" reads off one
set of names across both ledgers.

## Find recipe

```bash
pnpm ai:sweep:constant-scope
```

The scan lives in `scripts/src/sweeps/constantScope/` rather than in this file, because it is a program: a
line-anchored regex cannot decide constant scope on its own — it reads a multi-line arrow as a constant, since
the `=>` lands on a later line, and it cannot tell where a declaration ends, since a template literal's `${…}`,
a `;` inside a string and a quote inside a regex literal all fool a bracket count. Its cases are pinned by
`getModuleScopeConstants.test.ts` and `scanCode.test.ts`, which is what makes "prove the scan can fail before
believing it passed" (`sweeps` skill) a thing that stays proved rather than a thing each pass re-does by hand.

A clean pass prints nothing: every exception below is a shape the scan reads for itself, and
`scripts/src/workspace/constantScope.test.ts` fails on anything it prints, so this rule is enforced rather than
swept.

## Judging a match

- **A function stays at module scope.** It holds no state, so nothing about it can leak between suites. But a
  helper that **captures** one of these constants is not that pure kind — it moves in alongside it. `oxlint`'s
  `unicorn/consistent-function-scoping` does not count a default parameter value as a capture, so a helper whose
  only capture is `(name = blobName)` takes a disable rather than a move back out.
- **A type or interface stays.** Types have no lifetime.
- **`vi.hoisted` and `vi.mock` stay** — mechanically hoisted above the imports.
- **Anything a `vi.mock` factory closes over stays**, for the same reason the factory does: `let mockDb` read by
  a `get db()` factory, or a path constant a mocked resolver returns, is reached from above the imports, where a
  `describe` scope is invisible. The scan reads the module-scope `vi.mock(…)` statements for the names they use.
- **A `const` initialized by top-level `await` stays**, because a `describe` callback is synchronous and cannot
  hold one. Converting it to `let` + `beforeAll` is worse: it makes a read-only fixture look like rebuilt state,
  which is the distinction the skill's `let` rule exists to carry. What the awaited initializer reads stays with
  it, transitively — a directory constant a glob is rooted at cannot move below the glob. What merely _derives_
  from the fixture does not: a map reduced from it, a regex a helper applies to it, can be built inside the
  describe that reads it, and the scan reports those.
- **Everything else moves in**, including a factory _call_ (`const message = createMessageEntity(…)`), which is
  state even though a function produced it.
- **Used by several `describe`s → declare it in each.** Never wrap them in an outer `describe` to share one: the
  skill bans nested `describe` for sub-grouping, so that trades one violation for another.
- **A hook belongs to the suite it tears down.** An `afterEach` registered at module scope moves in with the
  state it cleans up.

## The environment a suite declares

`apps/web`'s vitest config leaves every file in the node environment and lets `// @vitest-environment nuxt`
opt in, because the nuxt environment builds the app per file — it is the difference between the suite's plain
files averaging well under a second and its nuxt files averaging several. So the directive is part of what a
test costs, and a suite that carries it without needing it is the same waste as a test that proves nothing.

Read what the file actually reaches for. A suite that mounts a component, resolves the router, or reads the nuxt
app (`useNuxtApp`, `useState`, a `$trpc` call, runtime config) needs the environment. One that only needs a
**DOM** — `window`, `DOMParser`, `navigator` — takes `happy-dom` instead, and one that needs neither takes the
default by carrying no directive at all. The check is empirical: drop to the cheaper environment and run the
file, because the failure names the global that was missing.

## Exclusions

- Coverage thresholds are not a reason to keep a test — a number that only holds because a test restates a
  constant is measuring nothing.
- `apps/web/uno.config.test.ts` and `apps/web/vuetify.config.test.ts` read as config restatements and are
  not: both snapshot **resolved** output, so the edit they catch is a `unocss` or `vuetify` bump moving a derived
  rule, colour or default with no diff in this repo. The `unocss` skill owns the reason; a pass that reaches them
  reads that first. They were deleted once on the restatement rule alone, which is why the reason is written
  down in two places rather than inferred from the files.

## Next enforceable

**Constant scope is enforced by `scripts/src/workspace/constantScope.test.ts`**, not by a lint rule, and the
reason is recorded so nobody rebuilds the rule. An AST selector — `Program > VariableDeclaration >
VariableDeclarator[init]` minus function expressions, `AwaitExpression` and `vi.hoisted` initializers — cannot
ask the two whole-Program questions the exceptions turn on: whether the file is a helper file (a `describe.todo`
beside one exported helper, `references/test-helper-files.md`) and whether a binding is read from a hoisted
`vi.mock` factory or an awaited initializer. The scan is a program and asks both, so the test over it is the
enforcer, and a lint rule would be a second, weaker copy of the same decision.
