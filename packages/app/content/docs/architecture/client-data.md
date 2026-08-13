---
title: Client data access
description: useQuery and useMutation are the two primitives for every user-facing tRPC read and write — non-blocking fetch, optimistic apply, staleness guarding, and error surfacing in one place.
---

# Client Data Access

Every user-facing tRPC call on the client goes through one of two symmetric primitives, both in `packages/app/app/composables/shared/`:

- **`useQuery`** — reads. Fetches without blocking setup, populates reactive data, surfaces errors.
- **`useMutation`** — writes. Applies optimistically, rolls back on failure, surfaces errors.

A third primitive sits beside them for the reads many stores share:

- **`useCachedRead`** — a store's shared read, cached until a write invalidates its tag. Covered in [caching](/docs/architecture/caching).

Both share the same error stack (`getResultAsync` → `createAlert`) and the same concurrency model — reads latest-wins per target, writes queued per target **by default**, with a write opting into latest-wins via `isSupersede` where dropping the earlier call is the intent, described in [Async operations](/docs/architecture/async-operations) — so no call site re-implements loading, error handling, or race protection.

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

`useQuery`'s data is **per instance**, so two components calling it fetch twice. A read that several surfaces share, and that should be read once per session, is `useCachedRead` on a store instead — see [caching](/docs/architecture/caching).

## useMutation

`useMutation` (`composables/shared/useMutation.ts`) returns `{ executeMutation, executeQuery, getIsPending, isPending }` and bundles the four things every write needs:

- **Optimistic apply + rollback** — write the change to the store immediately, roll it back if the server rejects it.
- **Concurrency by target** — writes to one `key` run one at a time, so two controls writing different fields of the same entity both land; reads for one `key` are latest-wins. The full model, the opt-ins, and the outcome statuses live in [Async operations](/docs/architecture/async-operations).
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
- `key` — **required**: the identity of the mutation's target. It scopes the write queue, the pending state, and exclusivity; calls with different keys are fully independent. How to choose one is in [Async operations](/docs/architecture/async-operations#targets). Never call `useMutation()` inside an action to fake isolation — that leaks a detached effect scope; key the shared store-root instance instead.
- `applyOptimistic` — the normal path. Apply the local change and return its rollback closure. It runs when the write is sent, so a queued write snapshots the state its predecessor stored. On failure the rollback runs. Where the entity has a subscription, the confirming server state also arrives through it and idempotently re-applies the same value — but not every mutation has one, so the rollback is what the correctness rests on, never the echo.
- `onSuccess` — the rare path, for mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`). Omit `applyOptimistic` and take the server result here.
- `onError` — replaces the default alert, only for surfaces that own a different error channel: the platform resource operations route failures into the [notifications bell](/docs/platform/notifications), including the stale-`contentVersion` warning with its Refresh action. Everything else omits it and gets the alert.

**A rollback restores the store row, never the control the value was typed into.** Whether the form's own copy follows it back is a separate decision, and it is made by asking whether the surface holding that copy is still on screen when the rejection lands. A settings panel is: it keeps the entered value, stays dirty, and the next save retries it. A menu or dialog that closed on submit is not, so its draft re-seeds from the row — otherwise it reopens showing a value the server refused, beside a readout of the row that never took it. The `vue` skill's watch decision tree owns the mechanics.

The optimistic apply and the server's own broadcast coexist — the write lands locally at once, and the echo re-applies the same value when it arrives:

```mermaid
flowchart TD
  Action[User action] --> Apply[applyOptimistic]
  Apply -->|writes change now| Store[(Store)]
  Apply -->|returns rollback closure| Mutate[tRPC mutate]
  Mutate -->|rejects| Rollback[Run rollback closure]
  Mutate -->|resolves| Success[onSuccess — server-authoritative result]
  Rollback --> Store
  Rollback --> Alert[createAlert with the real Error.message]
  Success --> Store
  Mutate -.->|server broadcast| Echo[Subscription echo]
  Echo -->|idempotently re-applies same value| Store
```

Call `useMutation()` once per logical action — each instance owns its own queue and pending bookkeeping, so two independent actions must **never** share one. A shared instance makes unrelated actions on the same entity id contend for one target: fire `deleteRole` while `createRole` is in flight and the delete waits behind a create it has nothing to do with, while `isPending` disables both surfaces. In a store with several mutations, declare one named instance per action via destructure renames (`const { executeMutation: executeCreateRoleMutation } = useMutation();`, with `isPending: isCreateRolePending` where the pending state is consumed); a single flow that branches into two tRPC calls (create-or-update save) correctly shares one instance, because its successive calls are successive writes to one target. One instance serving many sibling **items** of the same action is the `key` case, not a reason for per-item instances.

**Placeholder creates stay on the shared store-root instance with a per-call `Symbol` key** (`createRoomCategory`). Each call owns a distinct placeholder object, so successive creates are genuinely independent operations — a shared key would serialize them behind one another for no reason, and every create is free to run at once.

## In-flight guarding

Queueing protects **state**, not **the server**: every `executeMutation` call still fires its network write (only an `isExclusive` drop prevents one), it just waits its turn. The surface that triggers a write is therefore responsible for making a pointless second trigger impossible while the first is in flight. Exactly one guard applies per surface — pick by shape, never hand-roll a pending flag:

- **Form dialogs** — free. `StyledFormDialog`'s submit path holds `isSubmitting`: it early-returns re-entrant submits and drives the confirm button's `loading`/`disabled`. Consumers wire nothing.
- **Plain buttons firing a non-optimistic write** (publish, duplicate, deploy, generate, restore) — bind the instance's `isPending` as both `:loading` and `:disabled`. When the mutation lives in a store or composable, it exposes the ref under a name that says which write is pending (`isPublicationPending`, `isDuplicatePending`) and that name threads down as an ordinary prop; overflow/action list items bind it as `disabled`. For per-item surfaces (each table row has its own button), bind `getIsPending(item.id)` instead so one row's in-flight write doesn't disable its siblings.
- **Per-item creates through a shared instance** — `key` + `isExclusive` (`createLike`), so one item's in-flight create drops only its own duplicates while sibling items stay live.
- **Optimistic writes** — no guard. The state flips synchronously, so a second click reads the new state and means something new (a favorite toggle un-favorites); disabling the control would swallow real intent, and the second write simply queues behind the first.
- **Fields that commit on blur and on Enter** — guard with a dirty check against the value last stored (`isDirty`), so the second emit for an unchanged field never issues a write at all.
- **Synchronous unmount** — closing/unmounting the triggering control before the round trip (`onComplete()`-first dialog closes, a selection toolbar cleared on click) is a complete guard by construction; don't add a second one. Where the mutation resolves its own target from the dialog store target (`renamingId` → the list row), **call it before the close and await the promise after** — closing first clears the target out from under it, and the mutation silently no-ops.

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

`useQuery` is the wrapper for a one-shot setup fetch. A read whose state shape differs — its own cursor, an inline error panel instead of an alert — skips the wrapper but still goes through `executeQuery` on a `useMutation()` instance of its own (`useDataset`, `useReadResourcesPage`, `useReadResourceTypeCounts`), so it inherits the latest-wins guarding and the pending flag without owning either. These stay off both wrappers entirely:

- **Search-as-you-type reads** go through `useAutoSearch` (see [Search](/docs/architecture/search)) — it shares the `getResultAsync` → `createAlert` error stack but cancels the superseded request with an `AbortController` instead of merely ignoring its result.
- **Background bookkeeping writes** (mark-read + mention-count clear on room enter, typing pings, push-subscription registration) — the user didn't act, so surfacing a failure as an alert would be noise; they stay raw fire-and-forget calls. The one that does go through `executeMutation` is the [offline cache](/docs/esbabbler/offline-cache) write, because it needs the per-partition queue — and it passes `onError: console.error` for exactly this reason. Wanting the ordering is not wanting the alert.
- **Composed SAS-upload flows** (generate upload URL → `uploadBlocks` → assign public URL) — the mutation is one step of a multi-step flow whose error/loading handling belongs to the composing function, like the device-coupled call operations.
- **The message send path** (`createMessage` in `store/message/data.ts`) — a bespoke optimistic flow (reactive `isLoading` placeholder + `MessageHookMap` hooks) that predates and exceeds what `applyOptimistic` models. `storeCreateMessage` is shared with the subscription handler, so **the push/hook order is a parameter, not a constant**: the sender's own message renders before its hooks (`isOptimistic`) because it has a loading bubble to keep responsive and a rollback if they reject, while a message from anyone else waits for them — pushed first it renders every attachment as a broken image until the url fetch lands, and pushed first on a rejected fetch it renders broken forever.
- **Call-session lifecycle operations** — `createCall` / `joinCall` / `joinCallByRoomId` / `leaveCall` (`store/message/room/call/index.ts`) stay on raw `getResultAsync(...).match(...)` (or a bare `await` when only the return value is needed). They can't use `useMutation` because they (a) consume the mutation's **return value** — `livekitToken`, `livekitUrl`, `participantMap`, `callSessionId` — to drive the LiveKit connect step, and (b) compose a local LiveKit `connect`/`disconnect` teardown with the remote sync. `setCameraEnabled` / `setMuteEnabled` are **not** in that family: each writes one field of the participant row and goes through `useMutation` keyed on the participant, exactly like `setHandRaised`. What the composing `toggle*` / `joinCall` / `selectVirtualBackground` flow branches on is the **local LiveKit device call** (`setCamera` / `setMicrophone`), which is the only half that can leave nothing to sync — a camera that never turned on has nothing to composite a background onto. A rejected server flag has been rolled back and reported by the primitive by the time the flow resumes, and must not cancel local work that already succeeded or tear down a call that is already connected. (The lobby `knock`/`admit`/`dismiss` actions in `knocker.ts` are likewise ordinary user actions on `useMutation` with `applyOptimistic`.)
- **Page-level gating loaders** — a page (or a publish-view root component like `ResourceDashboardView`) whose read _is_ the reason to render keeps the top-level `await` and, on failure, `throw createError({ statusCode: 404 })` or navigates away. The failure must block/redirect, not render an empty component behind an alert, so `useQuery`'s non-blocking background fetch is the wrong tool. Event-triggered imperative reads (fetch on button click, not on setup) likewise stay on `getResultAsync(...).match(..., createAlert)` — `useQuery` auto-fetches on setup and can't be deferred to a user action.
