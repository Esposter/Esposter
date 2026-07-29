---
title: Client data access
description: useQuery and useMutation are the two primitives for every user-facing tRPC read and write — non-blocking fetch, optimistic apply, staleness guarding, and error surfacing in one place.
---

# Client Data Access

Every user-facing tRPC call on the client goes through one of two symmetric primitives, both in `packages/app/app/composables/shared/`:

- **`useQuery`** — reads. Fetches without blocking setup, populates reactive data, surfaces errors.
- **`useMutation`** — writes. Applies optimistically, rolls back on failure, surfaces errors.

Both share the same error stack (`getResultAsync` → `createAlert`) and latest-wins staleness guarding, so no call site re-implements loading, error handling, or race protection.

## useQuery

`useQuery` (`composables/shared/useQuery.ts`) replaces top-level `await $trpc.x.query(...)` in a **component** whose read is ancillary — the component should render immediately and populate when data lands. A top-level await forces the component under a `<Suspense>` boundary and throws on failure; `useQuery` fetches in the background instead, so the component renders immediately and populates when data lands — no `Suspense`, no `NuxtErrorBoundary`.

It is **not** for page-level loaders that must gate rendering or 404 on a missing resource — those keep the top-level `await` and `throw createError(...)` / navigate on failure (see the page-level bullet under [When not to use them](#when-not-to-use-them)).

```ts
const { data, refresh } = useQuery(() => $trpc.room.readMyInvite.query({ roomId }), {
  onSuccess: (result) => {
    // rare: derive local state from the loaded result
  },
});
```

- `query` — the tRPC read. The only required argument.
- `data` — a `shallowRef` holding the result, `undefined` until the first fetch resolves. Render loading/empty state off `data.value === undefined`.
- `refresh` — re-runs the query (retry after a failure, or refetch on demand). The initial fetch fires automatically on setup.
- `onSuccess` — rare; for seeding local state from the loaded result.

On failure the real `Error.message` is raised as an alert and `data` stays `undefined`, so the component falls back to its empty state. A superseded fetch (a newer `refresh`, a remounted component) can never overwrite a newer result.

## useMutation

`useMutation` (`composables/shared/useMutation.ts`) returns `{ executeMutation, getIsPending, isPending }` and bundles the four things every write needs:

- **Optimistic apply + rollback** — write the change to the store immediately, roll it back if the server rejects it.
- **Staleness guarding** — when the same action fires repeatedly (rapid clicks, drags, select changes), a slower earlier call can never overwrite a newer call's state. Staleness is tracked **per `key`**, so one instance serving many sibling items (a store action keyed by `postId`) never lets item B's call cancel item A's callbacks.
- **Pending state** — `isPending` is true while any of the instance's calls is in flight; `getIsPending(key)` scopes it to one key for per-item surfaces (a table row's own button). They are what the triggering control binds as `:loading`/`:disabled` (see [In-flight guarding](#in-flight-guarding)).
- **Error surfacing** — a failed mutation raises the actual error message as an alert; no call site writes `try`/`catch` or bespoke alert strings.

```ts
const { executeMutation, getIsPending, isPending } = useMutation();

await executeMutation(mutate, {
  applyOptimistic: () => {
    // write the change to the store now
    return () => {
      // rollback closure — undo the write
    };
  },
  key: input.id,
  onSuccess: (result) => {
    // rare: write a server-authoritative result
  },
});
```

- `mutate` — the tRPC call.
- `key` — **required**: the identity of the mutation's target, scoping staleness, pending, and exclusivity bookkeeping; calls with different keys are fully independent. It is explicit for the same reason a Pinia store id is — identity is the caller's knowledge, and a silently shared default was exactly the class of bug that kept resurfacing (operations on different entities stale-dropping each other's rollbacks and `onSuccess`). The choice is mechanical:
  - **Operation on an existing entity** → its id or natural composite (`input.id`, `` `${userId}-${roleId}` ``, a blob path). Repeated saves of the same target share the key, so genuine latest-wins supersession still works.
  - **Create with no id yet** → a per-call `Symbol("createRoom")` (every create is its own independent operation), or a stable key + `isExclusive` when a duplicate fire must be dropped instead (`createLike`, the initial survey response).
  - **Singleton target** (current user's settings, one screen's single subject) → the scope's id when one exists, else a stable name string for the target (`key: "userSettings"`). Keys are scoped per instance, so names cannot collide across instances.

  Never call `useMutation()` inside an action to fake isolation — that leaks a detached effect scope; key the shared store-root instance instead.

- `isExclusive` — single-flight: while a call with the same key is in flight, further calls are dropped outright — nothing fires, no staleness bump. For non-idempotent creates that must never double-fire (`createLike`).
- `applyOptimistic` — the normal path. Apply the local change and return its rollback closure. On failure the rollback runs (unless a newer call has superseded this one); the confirming server state still arrives via subscriptions, which idempotently re-apply the same value.
- `onSuccess` — the rare path, for mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`). Omit `applyOptimistic` and take the server result here; it is written only if this call is still the latest.
- `onError` — replaces the default alert, only for surfaces that own a different error channel: the platform resource operations route failures into the [notifications bell](/docs/platform/notifications), including the stale-`contentVersion` warning with its Refresh action. Everything else omits it and gets the alert.

Both `applyOptimistic` and `onSuccess` are staleness-guarded so a superseded call leaves the newer state intact. The error alert always fires with the real `Error.message`.

```mermaid
flowchart TD
  Action[User action] --> Exclusive{isExclusive and same key still in flight?}
  Exclusive -->|yes| DropCall[Drop call — nothing fires]
  Exclusive -->|no| Apply[applyOptimistic]
  Apply -->|writes change now| Store[(Store)]
  Apply -->|returns rollback closure| Mutate[tRPC mutate]
  Mutate -->|resolves| Stale{Superseded by a newer call?}
  Mutate -->|rejects| StaleError{Superseded by a newer call?}
  Stale -->|no| Success[onSuccess — server-authoritative result]
  Stale -->|yes| Drop[Discard result — newer state wins]
  Success --> Store
  StaleError -->|no| Rollback[Run rollback closure]
  StaleError -->|yes| Drop
  Rollback --> Store
  Rollback --> Alert[createAlert with the real Error.message]
  Mutate -.->|server broadcast| Echo[Subscription echo]
  Echo -->|idempotently re-applies same value| Store
```

Call `useMutation()` once per logical action — each instance owns its own staleness and pending bookkeeping, so two independent actions must **never** share one. A shared instance lets a newer unrelated call supersede an older action's `onSuccess`/rollback (fire `deleteRole` while `createRole` is in flight and the created role never lands in the store). In a store with several mutations, declare one named instance per action via destructure renames (`const { executeMutation: executeCreateRoleMutation } = useMutation();`, with `isPending: isCreateRolePending` where the pending state is consumed); a single flow that branches into two tRPC calls (create-or-update save) correctly shares one instance, because its successive calls do supersede each other. One instance serving many sibling **items** of the same action is the `key` case, not a reason for per-item instances.

**Placeholder creates stay on the shared store-root instance with a per-call `Symbol` key** (`createRoomCategory`). Each call owns a distinct placeholder object, so successive creates are independent — they must never supersede each other. Under a shared key, a second create would mark the first stale and skip its `onSuccess`, stranding a temp-id placeholder for a row that exists server-side under a different id (a later rename/delete then 404s); the per-call `Symbol` gives every create its own key, so nothing supersedes anything. Superseding is only correct when the later call targets the _same_ state as the earlier one.

## In-flight guarding

Latest-wins staleness protects **state**, not **the server**: every latest-wins `executeMutation` call still fires its network write (only an `isExclusive` drop prevents one). The surface that triggers a write is therefore responsible for making a second trigger impossible while the first is in flight. Exactly one guard applies per surface — pick by shape, never hand-roll a pending flag:

- **Form dialogs** — free. `StyledFormDialog`'s submit path holds `isSubmitting`: it early-returns re-entrant submits and drives the confirm button's `loading`/`disabled`. Consumers wire nothing.
- **Plain buttons firing a non-optimistic write** (publish, duplicate, deploy, generate, restore) — bind the instance's `isPending` as both `:loading` and `:disabled`. When the mutation lives in a composable, the composable returns the renamed ref (`isPublishPending`) and it threads down as an ordinary prop; overflow/action list items bind it as `disabled`. For per-item surfaces (each table row has its own button), bind `getIsPending(item.id)` instead so one row's in-flight write doesn't disable its siblings.
- **Per-item creates through a shared instance** — `key` + `isExclusive` (`createLike`), so one item's in-flight create drops only its own duplicates while sibling items stay live.
- **Optimistic writes** — no guard. The state flips synchronously, so a second click reads the new state and means something new (a favorite toggle un-favorites); disabling the control would swallow real intent, and a superseded call is already staleness-guarded.
- **Synchronous unmount** — closing/unmounting the triggering control before the round trip (`onComplete()`-first dialog closes, a selection toolbar cleared on click) is a complete guard by construction; don't add a second one.

## Optimistic by default

**Every `useMutation` write applies optimistically (`applyOptimistic`) unless it falls into a documented exception below.** Waiting for the server round-trip before the UI reflects a change is a bug, not a default — the user acted, so the UI updates now and rolls back only if the server rejects it. When a subscription echoes the change back to the caller (most room/message/friend/role actions), the optimistic apply and the idempotent echo coexist: apply immediately, the echo re-applies the same value on success, the rollback undoes it on failure.

A **server-generated id alone is not an exception.** When the created row appears in an on-screen list **and the client can faithfully build it**, insert a **temp placeholder row** optimistically and reconcile the real row in `onSuccess` — the `createMessage` flow in `store/message/data.ts` is the reference, and `createRoomCategory` follows it for its flat row. The client invents a throwaway `crypto.randomUUID()` id (the store keys by id), then `Object.assign(placeholder, serverRow)` swaps in the real one on the **same reactive object**, so the row keeps its list position instead of being removed and re-appended. The placeholder must be `reactive()` — `createItem` pushes the raw object into a `ref([])`, and mutating a raw target there wouldn't trigger the re-render.

Two tests gate this, and both must pass — otherwise the ceremony is pure cost:

1. **Faithful** — if the placeholder would have to guess server-computed or relational fields the client doesn't have, it renders **wrong data** for a frame (see the relational-row exception below).
2. **On-screen** — the list must actually be visible when the create fires (see the off-screen exception below).

A mutation may skip `applyOptimistic` **only** in these cases (surface the result via `onSuccess`/`onError` instead):

- **Relational / server-computed row** — the created row carries fields the client cannot faithfully fabricate: aggregate counts + author/relation graphs (`createPost`, `createComment`) or a server-assigned ordinal/permission bitfield (`createRole`). A guessed placeholder would flash incorrect data, and where the create also has a subscription echo (`createRole`, `sendFriendRequest`) the server-id row races the temp-id placeholder into a transient duplicate. Take the real row in `onSuccess`; the echo (if any) reconciles the other clients.
- **Off-screen create** — the created row lands in a view that isn't visible at creation time, so an optimistic apply updates a list nobody can see and buys nothing. `scheduleMessage`/`scheduleReminder` land in the drafts/sent list on another view. `createSearchHistory` is the subtler case: it fires from `useReadSearchedMessages` at the moment the right drawer switches to **results**, while the history list itself lives inside the search input's `v-menu` dropdown — which is closed by then. Hand-fabricating the row there would cost ~20 lines for zero perceived UX. Use `onSuccess`.

- **The server-generated value _is_ the visible result** — the mutation exists to reveal data the client cannot predict: a secret token or share link (`createInvite`, `createWebhook`, `rotateToken`), or a dedup-resolved id used only to navigate (`joinRoom`, `createDirectMessage`, resource `duplicate`). There is no on-screen state to pre-apply.
- **Optimistic-concurrency writes** — the server returns a bumped version token that drives the _next_ write, and a stale token must surface a refresh prompt: `saveResourceContent` (`contentVersion`), survey `createSurveyResponse`/`updateSurveyResponse` (`modelVersion`), resource `publish` (`publishVersion`). Handle the conflict in `onError`.
- **Server-authoritative outcome** — moderation (`executeAdminAction`): the effect shape (ban / mute / kick / timeout) is decided server-side and applied via the subscription echo, so there is nothing correct to apply before the server responds.
- **Rapid-fire integrity hazard** — `createLike`: a temp local like lets a rapid second click fire another `createLike` and hit the likes primary-key constraint; guarded single-flight with `{ isExclusive: true, key: postId }` instead of an optimistic row.

Any new non-optimistic mutation must justify itself against this list; if it doesn't fit, it is optimistic.

## Server-side effects a mutation does not return

A mutation often changes more than the row it was asked to change: creating a reply auto-follows its thread, a moderation action stamps a timeout, a send touches the room's ordering. A store that loaded the affected state once per room and never revisits it will render the stale version indefinitely — a follow button offering **Follow** for a thread the user is already following, and cannot turn off.

The rule is per side effect, decided by who can construct the result:

- **The client can construct it** → mirror it locally at the call site that caused it, through a `store*` function that takes only what the caller holds (`storeFollowThread(roomId, threadRootRowKey)`). No round trip, and the mirror is idempotent so a subscription echo re-applying the same value is a no-op.
- **Only the server can construct it** (it resolves an entity, an ordinal, or an aggregate the client never had) → re-read that slice after the write, and say so in a comment. Following a thread from the drawer re-reads because the drawer lists the **root message entity**, which the button holds no copy of.

Both shapes are correct; what is never correct is leaving the state stale because the mutation "was only about something else". An asymmetry between two neighbouring actions (one mirrors, one re-reads) is a deliberate consequence of this rule, not an oversight.

## When not to use them

Both primitives alert on failure. Two neighbouring patterns stay on the lower-level `getConcurrentFunction` (`packages/app/shared/util/function/getConcurrentFunction.ts`), which provides staleness guarding alone:

- **Paginated / event-driven reads** (e.g. `useReadMessages`, `useDataset`) — own their own cursor/error state and surface failure inline rather than as an alert; they are not one-shot setup fetches, so `useQuery` doesn't fit.
- **Local-only concurrency** (e.g. LiveKit virtual-background switching) — no server call, nothing to alert.
- **Search-as-you-type reads** go through `useAutoSearch` (see [Search](/docs/architecture/search)) — it shares the `getResultAsync` → `createAlert` error stack but replaces `getConcurrentFunction` with an `AbortController`, cancelling the superseded request instead of merely ignoring its result.
- **Background bookkeeping writes** (mark-read + mention-count clear on room enter, typing pings, push-subscription registration) — the user didn't act, so surfacing a failure as an alert would be noise; they stay raw fire-and-forget calls.
- **Composed SAS-upload flows** (generate upload URL → `uploadBlocks` → assign public URL) — the mutation is one step of a multi-step flow whose error/loading handling belongs to the composing function, like the device-coupled call operations.
- **The message send path** (`createMessage` in `store/message/data.ts`) — a bespoke optimistic flow (reactive `isLoading` placeholder + `MessageHookMap` hooks) that predates and exceeds what `applyOptimistic` models. `storeCreateMessage` is shared with the subscription handler, so **the push/hook order is a parameter, not a constant**: the sender's own message renders before its hooks (`isOptimistic`) because it has a loading bubble to keep responsive and a rollback if they reject, while a message from anyone else waits for them — pushed first it renders every attachment as a broken image until the url fetch lands, and pushed first on a rejected fetch it renders broken forever.
- **Call-session lifecycle operations** — `createCall` / `joinCall` / `joinCallByRoomId` / `leaveCall` (`store/message/room/call/index.ts`) stay on raw `getResultAsync(...).match(...)` (or a bare `await` when only the return value is needed). They can't use `useMutation` because they (a) consume the mutation's **return value** — `livekitToken`, `livekitUrl`, `participantMap`, `callSessionId` — to drive the LiveKit connect step, and (b) compose a local LiveKit `connect`/`disconnect` teardown with the remote sync. `setCameraEnabled` / `setMuteEnabled` are the device-coupled leaves of the same family: they hand-roll optimistic apply + rollback + **rethrow** so the composing `toggle*` / `joinCall` / `selectVirtualBackground` flow owns the outcome — `useMutation` would alert-and-swallow instead, breaking that contract. (The lobby `knock`/`admit`/`dismiss` actions in `knocker.ts` are **not** in this family — they are ordinary user actions and use `useMutation` with `applyOptimistic`.)
- **Page-level gating loaders** — a page (or a publish-view root component like `Resource/Dashboard/View.vue`) whose read _is_ the reason to render keeps the top-level `await` and, on failure, `throw createError({ statusCode: 404 })` or navigates away. The failure must block/redirect, not render an empty component behind an alert, so `useQuery`'s non-blocking background fetch is the wrong tool. Event-triggered imperative reads (fetch on button click, not on setup) likewise stay on `getResultAsync(...).match(..., createAlert)` — `useQuery` auto-fetches on setup and can't be deferred to a user action.
