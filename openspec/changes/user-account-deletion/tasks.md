# Tasks

Build order. Section 1 lands the schema the rest reads, section 2 moves the shared sweeps into `packages/db`, section 3 is the handler that runs them, section 4 is the trigger and the settings flow, and section 5 the sweep and the inventory. The change is archived only when every box is ticked.

## 1. Schema

- [x] 1.1 Cascade the `accounts` foreign key on the user row, and add `deletionRequestedAt` to `users`. Test first in the schema's test: deleting a user row removes its linked account rows. Generate the migration with `db:gen`, then check its SQL by hand.
      Verify: the cascade test passes, and the generated migration alters the `accounts` foreign key to cascade and adds the column nullable.

## 2. Shared sweeps

- [x] 2.1 Move the per-user soft delete inside one room from `apps/web/server/services/message/moderation/softDeleteRoomMessagesByUser.ts` into `packages/db`, so the functions app and the web app share one implementation. Test first in the moved file's test: only the target user's messages in that room are soft-deleted.
      Verify: the web's moderation tests pass unchanged, and no copy of the soft delete remains outside `packages/db`.
- [ ] 2.2 Add `deleteUserDirectories` in `packages/db`: it removes every blob under `{userId}/` in the given containers, and every blob under `character-packs/staging/{userId}/` in the game-asset container, and treats an empty directory as done. Test first: a directory with two blobs is removed, a staged blob under `character-packs/staging/{userId}/` is removed, and a second call finds nothing and succeeds.
      Verify: the test passes, and the function's container list is the inventory's list for user prefixes.
- [x] 2.3 Add `listChargedBlobsByUser` in `packages/db`: it reads the storage ledger rows for one user, grouped by container. Test first: a user with two charged blobs in two containers gets both, and another user's rows are not among them.
      Verify: the test passes against the ledger table, not against a list of blob names.

## 3. Handler

- [ ] 3.1 Write `deleteAccountHandler` in `apps/functions/src/handlers/`. It runs the sweeps in this order and fails if any step fails: owned rooms (partitions, attachment prefix, profile images, then the room row), owned resources through `purgeResource`, the user's messages in member rooms, the charged blobs from the ledger, the user's blob prefixes, then the user row last. Test first, one test per step: each step removes exactly its store, and a failing step leaves the user row.
      Verify: every step test passes, and a test that fails the blob step asserts the user row still exists.
- [ ] 3.2 Make the handler idempotent: a second run over a finished sweep finds nothing and succeeds. Test first: running the handler twice leaves the same final state and returns success both times.
      Verify: the replay test passes.
- [ ] 3.3 Register the handler as `AzureFunction.DeleteAccount` in `apps/functions/src/functions/`, and add the event type to `AzureFunction` in `packages/db-schema`.
      Verify: the function index test lists the new function, and the enum entry is the one the web publisher imports.

## 4. Trigger and settings

- [ ] 4.1 Add the `user.deleteAccount` mutation. It ends the caller's sessions, sets `deletionRequestedAt`, and publishes the Event Grid event after the write, as the room and resource deletions publish. Test first in the user router's test file: the caller's sessions are gone, the marker is set, and the publish happens once.
      Verify: the router test passes, and the mutation's input has no field that could bypass the typed confirmation.
- [ ] 4.2 Add the Delete account flow to `apps/web/app/pages/user/settings.vue`. It opens a confirmation that names what is kept, requires the person to type their display name, and calls the mutation. Test first: the button does not call the mutation until the typed name matches.
      Verify: the settings test shows the kept list and the refusal to call the mutation on a click alone.
- [ ] 4.3 Subscribe the new event type in both environments' Event Grid subscription files under `apps/infra`.
      Verify: the dev and prod subscription files each list `AzureFunction.DeleteAccount`, and the infra test passes.

## 5. Sweep, inventory and specs

- [ ] 5.1 Update the user data inventory's table to name the removal this change adds for each store, and its Known gaps list to match what the sweep does not reach.
      Verify: no row in the inventory says "not removed" for a store the sweep covers, and every gap names the spec line that states it.
- [ ] 5.2 Run the account deletion end to end against the in-memory test database: create an account with a room, a resource, messages, an attachment and a save, delete it, and check every store the inventory lists.
      Verify: the end-to-end test passes, and it asserts each store is empty for the account.
