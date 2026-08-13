# Testing a tRPC router

Read when writing or reviewing a test that drives a tRPC caller. General Vitest conventions (caller naming, creating resources via callers rather than `db.insert`, mock cleanup) belong to the `testing` skill.

## `setupRoomSuite()` fixture

Any room-scoped router suite where every test needs a room uses `setupRoomSuite()` (`server/trpc/routers/setupRoomSuite.test.ts`) at the top of `describe`. It owns `createMockContext`, the room/role callers, a fresh room per test (`beforeEach`) and cleanup (`MockTableDatabase.clear()` + `db.delete(roomsInMessage)` in `afterEach`), and returns `createMember`/`setupMemberWithRole` plus `getMockContext`/`getRoomCaller`/`getRoleCaller`/`getRoomId` getters.

Suites alias the getters into local `let`s in their own `beforeAll`/`beforeEach` so test bodies stay unchanged; suite-specific hooks (fake timers, extra table deletes) compose alongside. Never copy-paste `createMember`/`setupMemberWithRole` or the room lifecycle hooks into a suite.

## Subscription tests: builder once, wiring smoke per router

`getRoomEventSubscription` behaviour (member check, room filter, same-device filter, data passthrough) is tested thoroughly ONCE in `server/trpc/procedure/room/getRoomEventSubscription.test.ts` through one representative subscription. Each router keeps only a **single** emit-wiring smoke test (one `getFirstEmit` happy path); do not add per-subscription filter/UNAUTHORIZED/other-room tests to router suites.

## Caller types

Always `TRPCRouter` path notation, never `typeof subRouter`:

```ts
let fooCaller: DecorateRouterRecord<TRPCRouter["foo"]>;
let fooBarCaller: DecorateRouterRecord<TRPCRouter["foo"]["bar"]>;
```

## A guard test must get past every guard in front of the one it names

Procedures stack gates — membership, then permission, then ownership/authorship — and they all throw a bare `UNAUTHORIZED`, so a test that fails at the first gate is indistinguishable from one that reached the gate its title claims. `mockSessionOnce(mockContext.db)` alone makes a **brand-new user who never joined the room**: that proves membership and nothing else, whatever the title says. To assert a permission or authorship rule, the caller has to be a member first:

```ts
const user = await createMember(); // the fixture's membership path — this user is actually in the room
await mockSessionOnce(mockContext.db, user); // replay the same user for the guarded call
```

Name the gate the test actually exercises — `fails update for a member without ${RoomPermission.ManageRoom} permission`, `fails update with a member who is not the author` — never "with wrong user", which describes no gate in particular. Two tests that differ only in setup but reach the same gate are one test; an unknown-id case is the exception worth keeping, because it pins `UNAUTHORIZED` over `NOT_FOUND` (no id enumeration).

## Error assertions

`toThrowErrorMatchingInlineSnapshot` is the only accepted error assertion (`toBeInstanceOf` is banned), and the TRPCError snapshot format is `[TRPCError: <message>]` — the prefix comes from TRPCError's `toString()`.
