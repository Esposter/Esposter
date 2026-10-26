# Tasks

Build order. Section 1 lands the row and the container the rest write to, section 2 the archive, section 3 the request and the link, and section 4 the settings flow. The export is archived only when every box is ticked.

## 1. Row and container

- [x] 1.1 Add the `dataExports` table in `packages/db-schema`: id, user, status (queued, building, ready, failed), blob name, failure reason, ready time and expiry time. Test first in the schema test: a second active row for one user is refused.
      Verify: the test passes, and the migration from `db:gen` is checked by hand.
- [x] 1.2 Add the private `DataExports` container to `AzureContainer`, with a lifecycle rule that deletes blobs seven days after they are last written.
      Verify: the container is listed in the infra container definitions as private, and the rule's age is the one the design states.

## 2. Archive

- [x] 2.1 Write the streamed archive builder in "apps/functions/src/services/user/", one function per archive entry group, writing through `fflate`'s streaming zip into a block blob upload. Test first: the builder's output unzips to the entries the design lists, and a person's other messages are not among them.
      Verify: the unzip test passes against the built archive, and the builder never holds a whole attachment in memory, which the test checks by reading each file as a stream.
- [x] 2.2 Write `exportUserDataHandler` in `apps/functions/src/handlers/`. It marks the row building, runs the builder over the export's own blob name, marks the row ready with its expiry, and marks it failed with the reason on error. Test first: a failing entry marks the row failed and offers no link.
      Verify: the failed-build test passes, and a replayed event rebuilds the same blob name.
- [x] 2.3 Register the handler as `AzureFunction.ExportUserData` in `apps/functions/src/functions/`, and add the event type to `packages/db-schema`.
      Verify: the function index test lists the new function.
- [x] 2.4 Add the archive's own-activity entries: `posts/{postId}.json`, `likes.json`, `friends.json`, and each owned room's `rooms/{roomId}/room.json` with its images and emoji. Other people's counts and records are left out, and the design names each exclusion. Test first: the builder's output holds these entries, and another person's counts and records are not among them.
      Verify: the builder tests pass for the posts, likes, friends and owned-room cases.

## 3. Request and link

- [x] 3.1 Add the `user.requestDataExport` mutation. It returns the active export when one exists, otherwise inserts a queued row and publishes the event after the write. Test first in the user router's test file: a second request returns the first export.
      Verify: the router test passes, and the publish happens once per new export.
- [x] 3.2 Add the `user.readDataExport` query and the `user.generateDataExportLink` mutation. The link is a read SAS of fifteen minutes, issued only to the owner, only when the export is ready and unexpired. Test first: another person gets no link, and an expired export gets no link.
      Verify: the owner, other-person and expired cases pass.
- [x] 3.3 Point each environment's Event Grid subscription under `apps/infra` at the export's event type.
      Verify: both subscription files, dev and prod, name `AzureFunction.ExportUserData`.

## 4. Settings and sweep

- [x] 4.1 Add the Download my data flow to `apps/web/app/pages/user/settings.vue`. It shows the three omissions before the request, shows the export's status while it builds, and offers the link once it is ready. Test first: the link is not shown while the export is building or failed.
      Verify: the settings test shows the omissions and withholds the link in those two states.
- [x] 4.2 Update the user data inventory's table to name the export entry for each store the archive reads, and its Known gaps to match what the archive omits.
      Verify: every store in the archive table names its entry, and every omission names the gap that states it.
- [x] 4.3 Run an export end to end against the in-memory database and the test blob container: seed an account that owns a room and a resource, and has messages, an attachment and a save, then request the export, build it, and unzip it.
      Verify: the end-to-end test passes and the unzipped archive holds each entry the design lists.
