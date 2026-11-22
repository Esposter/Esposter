# Writing a store mutation action

Read when a store action writes to the server, or when its write's entry or its `useMutation` key is being chosen. `SKILL.md` keeps the one-line rules; this page is how each form is wired.

## A write to a server row is an overlay write

The overlay store (`apps/web/app/store/overlay.ts`) is the one writer of the server rows a store holds. A store issues its writes through it and reads its rows back through its view:

- **`writeOptimistic(mutate, { entry, onError })`** for a write the screen shows at once. `entry` is a pure function over the keyed view: it reads and writes rows by key through the view it is handed, and nothing else. The registry runs it once to find the rows it touches, and queues the write behind each earlier write whose rows overlap. The store names no key.
- **`writeAwaited(mutate, { awaitedBecause, onError })`** for a write the screen waits on. It has no entry and takes no key: the version gate orders two answers for one row, and `awaitedBecause` names the reason the server answers it, as `executeMutation`'s awaited form does.
- **The answer's rows arrive, and a failed write drops its entry.** The response names the version of each row the write changed. The entry is confirmed at those versions and drops once held state is at or above them. A refused write changes no held state, so there is nothing to restore.
- **A row's removal is a tombstone a read returns**, so the view hides it and an older arrival cannot bring it back. Absence never removes a held row.

The rules and their reasons are `openspec/changes/archive/2026-11-22-architecture-optimistic-overlay/design.md` (The model, Entity keys, Settling). `deleteFriend` in `apps/web/app/store/message/user/friend.ts` is the shape of an entry and its answer together.

## A write off the overlay

A mutation whose rows the overlay does not hold runs through `useMutation()` (`apps/web/app/composables/shared/useMutation.ts`):

- **Declare every instance at the store root** — `const { executeMutation } = useMutation()`. Never inside an action, since a detached effect scope leaks; `setup-scope/no-detached-mutation` fails the lint on one.
- **Say why the write waits.** An awaited write names one reason from the closed set in `apps/web/app/models/shared/AwaitedReason.ts`, and its `onSuccess` acts on the server's value.
- **Whether an awaited write landed is the outcome's `status`**, never a flag `onSuccess` flips. An awaited action behind a dialog returns `outcome.status === MutationStatus.Succeeded`, so the dialog stays open on a refusal.
- **Every call takes a `key`.** Writes that share a key queue one at a time within one instance; two instances never serialize against each other however their keys are spelled. `sendForward` in `apps/web/app/store/message/input/forward.ts` is the shape.

## Picking the key of a `useMutation` write

Same key means same target, so those writes queue behind each other.

- **Per-entity operations** take the entity id or its natural composite, joined with the `naming` skill's `ID_SEPARATOR` (`references/composite-keys.md`). Never a hand-written hyphen, since a uuid contains hyphens and such a key cannot be split back apart.
- **Creates** take the id the client gave the row, so every create is independent of its siblings. An awaited create with no id of its own takes a per-call `Symbol(...)`. Use a stable key plus `isExclusive` instead when duplicate fires must drop.
- **Singleton targets** take the scope's id or a stable target name.

## A store action earns its place

Do **not** create a Pinia action that only wraps a single `$trpc.xxx.mutate(...)`. The caller runs the write itself, through the overlay or its own `useMutation`, when its result is handled by a typed event or no shared state changes. Add a store action only when it adds meaningful client logic: an overlay entry over the store's rows, navigation or local side effects tied to the result, shared state updates no typed event covers, or coordination of several stores, requests or validation steps (`openspec/specs/architecture/client-data/design.md`).
