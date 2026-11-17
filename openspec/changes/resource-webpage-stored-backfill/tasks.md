# Tasks

## 1. The scan

- [ ] 1.1 Count the stored webpage content documents lacking `isIndexable`, and the stored webpage nodes lacking `elementId`, in dev and in prod, with the newest such row's `updatedAt` for each. Verify: the dry run prints each store's document and slot counts.

## 2. The backfill

- [ ] 2.1 Write the scratchpad script per the `backfills` skill's `references/the-run.md`: set `isIndexable` to `true` where absent, and `elementId` to a unique id of the node id's characters and length where absent, guarded by the `updatedAt` or etag it read. Verify: the dry run on dev reports the counts from 1.1 and changes nothing.
- [ ] 2.2 Run the write on dev, then on prod straight after, and re-run until it reports nothing to change. Verify: a final dry run on prod reports zero documents to change, and the script is deleted from the scratchpad.

## 3. The check

- [ ] 3.1 Read one previously stored webpage on dev and one published on prod through `readResourceContent` and `readPublishedResourceContent`. Verify: both parse and return the page, with the owner's read and the public read both succeeding.
