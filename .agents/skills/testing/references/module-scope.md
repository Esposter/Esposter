# What May Live at Module Scope

Read when a test file declares anything outside its `describe` — a constant, a fixture, a helper, a hoisted mock — or `constantScope.test.ts` reports one.

## Why every constant is inside the `describe`

Nothing but imports, pure helper functions and hoisted mocks lives at module scope. Every constant — a literal, a fixture object, an entity built by a factory — is a `const` **inside the `describe` callback**. The reason is reachability, not memory: both are created during collection and freed at the same teardown, but a binding a sibling suite can reach is one a sibling suite can mutate, which is how a suite becomes order-dependent. Moving it inward bounds who can reach it, not what they do with it: `const` does not freeze an object, so tests sharing a fixture treat it as read-only, and one a test mutates is built in that test or in a `beforeEach`.

## What cannot move inward

The exceptions are the `vi.hoisted` block, which `vi.mock` lifts above the imports, **anything a `vi.mock` factory closes over** (the `let mockDb` a `get db()` factory returns), and a fixture a **top-level `await`** builds, with what its initializer reads (a `describe` callback is synchronous); what merely derives from such a fixture — a map reduced from it, a regex a helper applies to it — is built inside the describe that reads it. `scripts/src/workspace/constantScope.test.ts` fails on everything else. A helper that captures a suite constant is not the pure kind and moves in with it — but **pure** here means it holds no binding a sibling suite can reach, never that it has no effects: a helper that stubs a global and builds its captured state per call is stateless in the sense the rule is about, and `unicorn/consistent-function-scoping` puts it at module scope for you, because it closes over nothing. A constant shared by sibling `describe`s is declared in each, because duplicating two lines beats a file-scope binding every block can reach. `describe.each` is the one case where the scoping is also a lifetime — its callback runs per case. State rebuilt per test is a `let` in the same place, initialized in `beforeEach` (`test-values` skill).
