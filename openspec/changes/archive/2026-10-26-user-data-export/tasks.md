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
- [x] 2.5 Add the archive's own records the inventory names: `searches.json`, `resources/{resourceId}/publications.json`, `resources/{resourceId}/links.json` and `moderation-actions.json`. Each is the person's own record, written as its row stores it: a search carries the time it ran, a link carries none since its set is rewritten on each change, and a moderation action carries its type, time and the id it was taken against. Test first: the builder's output holds each, and another person's searches and the actions taken in rooms they do not own are not among them.
      Verify: the builder tests pass for the search, publication, link and moderation action cases.
- [x] 2.6 Add the calls the person started (`calls.json`), with their room, thread and start time, and no join id. Test first: the builder's output holds the person's own calls, and another person's call is not among them.
      Verify: the builder tests pass for the calls case.
- [x] 2.7 Add the person's own thread follows (`follows.json`), unfollows included, with the time of the first decision. Test first: the builder's output holds the person's own decisions, and another person's follow of the same thread is not among them.
      Verify: the builder tests pass for the follows case.
- [x] 2.8 Add the person's memberships in rooms they do not own (`memberships.json`), with their settings there and their roles, and no other member's row, derived count or operational clock. Test first: the builder's output holds the person's membership and its roles, and not the other member's row or the person's row in a room they own.
      Verify: the builder tests pass for the memberships case.
- [x] 2.9 Add the person's own favorites and accesses (`favorites.json`, `accesses.json`). An access keeps the first and last times it was opened, and a favorite its time of starring. Test first: the builder's output holds the person's favorite and access, and not another person's.
      Verify: the builder tests pass for the favorites and accesses case.
- [x] 2.10 Omit the program participant and survey response exports, as a named exclusion by decision. The server stores no user id on those rows, and adding one would link an anonymous survey answer to a person. The user can reverse it with a data change that stores a user id on new rows. Neither `programs.json` nor `surveys.json` is written.
      Verify: the design's Not included and Decisions name the exclusion and its reason, and the inventory's rows for both stores name it.

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
