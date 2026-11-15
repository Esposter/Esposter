# Router and DB Test Setup

Read when a test drives tRPC callers, queues mock sessions, seeds rows into the mock DB, or needs naming.

## Naming and coverage

- **CRUD descriptions** — happy paths use the bare verb (`"creates"`, `"updates"`, `"deletes"`), one per operation with all field assertions combined; error paths follow `"fails <operation> with <condition>"`. Never a scratch or repro label — name the condition being rejected, not the mechanics of triggering it.
- **Don't repeat generic middleware tests** — shared middleware (auth, membership, permissions) is tested once; no redundant UNAUTHORIZED/NotFound test per procedure.
- **Shared procedure/subscription builders: thorough once, wiring smoke per consumer** — where endpoints are config-only instantiations of a shared builder, its full behaviour matrix lives in the builder's own colocated test through ONE representative endpoint, and each consuming router keeps a single happy-path wiring test.

## Caller declaration

- **`createCallerFactory` double-call** — always inline: `caller = createCallerFactory(router)(mockContext)`. No intermediate variable.
- **Caller naming** — single: `caller`. Multiple: descriptive (`roomCaller`, `roleCaller`).
- **Declaration order in `describe`** — `let mockContext: Context` → caller `let`s → `const` test constants.
- **`beforeAll` body order** — `mockContext` first, then callers. Never extract sub-properties (no `let db = mockContext.db`); always access via `mockContext.db`.

## Who the caller is

A caller is its context. `createMockContext(authSession?)` acts as the default identity, the **base user** that `createMockContext` inserts and every test's rooms and resources belong to, and `createMockContext(null)` is signed out. A context's caller is fixed for its life, as a request's is, so a test acting as two people holds two contexts and two callers. Nothing is queued and nothing is consumed: production reads the session once, in `createContext`, and a test hands its context the caller instead.

- **Owner = base user, always.** The suite's default caller (`createCallerFactory(router)(mockContext)` in `beforeAll`) is the owner. Never mint another user just to own a room.
- **`getMockSession()`** is the default identity, one user and one session for the whole run.
- **`createMockAuthSession(db, existingUser?)`** is a fresh user with a session row of their own. Given a user the test already has, it is a second device of theirs. Build a caller over it to act as that user:

  ```ts
  const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db));
  ```

  `createMockCaller(router, authSession?)` is the one helper for a second caller; a suite never keeps a local room-caller twin of it.

- **`createMockUser(db)`** is a second user for the test to _act on_ rather than _act as_: it returns the user alone.
- **Two devices of one person** are two auth sessions of one user, each its own context. A test whose behaviour turns on `session.id` builds them explicitly rather than expecting a fresh session per call.

## DB cleanup and setup

- **Clean in `afterEach`, never `beforeEach`** — `await mockContext.db.delete(table)` in `afterEach` so leaks from failed tests are visible.
- **Use callers, not `db.insert`** — set up state via tRPC callers. Only use `db.insert` when creating a user who should NOT have a session (non-member auth failure tests), or in service-layer unit tests (`server/services/**`) where router callers create upward coupling.
- **Never `mockContext.db.select`** — read state via callers (e.g. `caller.readRoles`).

### Symmetric setup and teardown

Every row inserted in setup must be removed in the teardown hook of the **same scope**: `beforeAll` inserts deleted in `afterAll`; per-test inserts (test body or `beforeEach`) deleted in `afterEach`. Hard rule, even though the mock DB is discarded at file end — keeps leaks visible and teardown intentional.

- **Delete only root tables; let cascades handle the rest** — when a child FK is `onDelete: "cascade"`, deleting the parent removes children, so don't add explicit `delete(childTable)`. E.g. deleting `users` and `roomsInMessage` already removes `usersToRoomsInMessage` rows.
- **UUID identifiers as `const` at `describe` scope, never `let` in `beforeAll`** — `v7()` doesn't depend on async setup: `const userId = v7()`. Only genuinely async-initialized values (e.g. `mockDb = await createMockDb()`) stay as `let` inside `beforeAll`.
