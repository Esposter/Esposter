# Tasks

## 1. The primitives

- [x] 1.1 `PageSort`, `PageCursor`, `Page`, `AnchoredPage`, `createPageInputSchema`, `createSortedPageInputSchema`, `encodePageCursor`, `decodePageCursor`, `createEmptyPage` in `packages/db-schema`. Verified by `packages/db/src/services/pagination/getPageWhere.test.ts` refusing four malformed cursors, for the scenarios 'A malformed cursor', 'Asking for a sort the list does not offer' and 'Too large a page'.
- [x] 1.2 `createPageSort`, `getPageWhere`, `getPageOrderBy`, `toPage`, `compareBySort`, `toPageCursorValue` in `packages/db`. Verified by `getPageWhere.test.ts` for the scenarios 'Reading a list to its end', 'Items that tie on the sort' and 'A list that changes while it is read', and a backward read; the tie test seen failing with a one-key comparison.
- [x] 1.3 The client store holds `Page`, derives `hasMore` from the cursor, and lands a late page on the list it was read for. Verified by `useCursorPaginationOperationData.test.ts` "drops a late page of a read a newer read replaced", the scenario 'Typing a new search while the last one loads more', seen failing with the page written to the current list.

## 2. Every read on the primitives

- [ ] 2.1 Messages: the message search, the scheduled tab and the sent list page by cursor over their merged sources, and the room object's message reads take the one cursor with an anchored read for a jump. Verified by each router's and object's suite reading a list to its end across a page boundary, and by the scenarios 'Jumping to an old message' and 'A search shows how many results it found'.
- [ ] 2.2 Rooms, members, invites, direct messages, bans, moderation log and notes: one declared sort each, ending in a unique key. Verified by their router suites.
- [ ] 2.3 Resources: the resource tables, the recycle bin, activities and content versions page by cursor, the table's column sort offered as named sorts each with an index. Verified by `createResourceProcedures.test.ts` and the resource router suite.
- [ ] 2.4 Posts, notifications, search history and the remaining lists: the post feed's sorts named and index-backed, the rest one declared sort. Verified by their router suites and the post router's test of the scenario 'Choosing an offered sort'.
- [ ] 2.5 Every client store on `useCursorPaginationData` or its map; the search keyed by its query. Verified by the store suites.

## 3. The old paths gone

- [ ] 3.1 Delete everything the design's "What is deleted" lists. Verified by `pnpm exec knip` at the root answering nothing and `git grep` finding none of the names.
- [ ] 3.2 Archive this change into the architecture specs as their pagination page and move the `pagination` skill's server and wire rules to point at it. Verified by `pnpm exec openspec validate --strict` and the openspec suites in `scripts`.
