# Router and DB Test Setup

For tests that drive tRPC callers, queue mock sessions, seed rows into the mock DB, or name a router test.

## Naming and coverage

- **CRUD descriptions** — happy paths use the bare verb (`"creates"`, `"updates"`, `"deletes"`), one per operation with all field assertions combined; error paths follow `"fails <operation> with <condition>"`. Never a scratch or repro label — name the condition being rejected, not the mechanics of triggering it.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once; no redundant UNAUTHORIZED/NotFound test per procedure.
- **Shared procedure/subscription builders: thorough once, wiring smoke per consumer** — where endpoints are config-only instantiations of a shared builder, its full behaviour matrix lives in the builder's own colocated test through ONE representative endpoint, and each consuming router keeps a single happy-path wiring test.

## Caller declaration

- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single: `caller`. Multiple: descriptive (`roomCaller`, `roleCaller`).
- **Declaration order in `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db`.

## Mock sessions

The default mock session is always the **base user** (inserted by `createMockContext`). This user is the owner for all rooms created in tests.

- **Owner = base user, always** — never use `mockSessionOnce(db)` to create a different user just to be a room owner. Applies to `beforeEach` and helpers like `setupRoom`.
- **`getMockSession()`** — returns the base user session (stable `user.id`, new `session.id` each call). Assign before use: `const owner = getMockSession().user`.
- **Default session is owner** — API calls with no queued `mockSessionOnce` run as the base owner. Never call `mockSessionOnce(db, owner)` before owner operations; use it only to consume a queued non-owner session.
- **`mockSessionOnce(db)`** — creates a new user in the DB AND queues their session for the next API call. After that call, the default owner resumes.
- **Consume pattern** — use `getMockSession()` to consume a queued session slot without making an API call:
  ```ts
  await mockSessionOnce(mockContext.db);  // create user, queue session
  const { user } = getMockSession();       // consume slot, get user
  await roomCaller.createMembers(...);     // runs as default owner
  ```
- **`mockSessionOnce(db, existingUser)`** — requeues an existing user's session without re-inserting. Use for non-owner member operations.
- **Target: 1 `mockSessionOnce` per test** — one for non-owner user creation; all owner operations use the default.
- **`replayMockSession`** — only when the exact same session payload must be reused across multiple calls, especially when `session.id` is part of the behavior under test. If only the same user matters, prefer `mockSessionOnce(db, user)` so the test does not couple itself to session identity. If the payload comes from a newly created `mockSessionOnce(db)` user and setup should continue as the default owner, first consume the queued slot with `getMockSession()`.
- **`getMockSession().session.id` is unstable** (new UUID each call); `user.id` is stable.

## DB cleanup and setup

- **Clean in `afterEach`, never `beforeEach`** — `await mockContext.db.delete(table)` in `afterEach` so leaks from failed tests are visible.
- **Use callers, not `db.insert`** — set up state via tRPC callers. Only use `db.insert` when creating a user who should NOT have a session (non-member auth failure tests), or in service-layer unit tests (`server/services/**`) where router callers create upward coupling.
- **Never `mockContext.db.select`** — read state via callers (e.g. `caller.readRoles`).

### Symmetric setup and teardown

Every row inserted in setup must be removed in the teardown hook of the **same scope**: `beforeAll` inserts deleted in `afterAll`; per-test inserts (test body or `beforeEach`) deleted in `afterEach`. Hard rule, even though the mock DB is discarded at file end — keeps leaks visible and teardown intentional.

- **Delete only root tables; let cascades handle the rest** — when a child FK is `onDelete: "cascade"`, deleting the parent removes children, so don't add explicit `delete(childTable)`. E.g. deleting `users` and `roomsInMessage` already removes `usersToRoomsInMessage` (and `scheduledMessageJobsInMessage`) rows.
- **UUID identifiers as `const` at `describe` scope, never `let` in `beforeAll`** — `crypto.randomUUID()` doesn't depend on async setup: `const userId = crypto.randomUUID()`. Only genuinely async-initialized values (e.g. `mockDb = await createMockDb()`) stay as `let` inside `beforeAll`.
