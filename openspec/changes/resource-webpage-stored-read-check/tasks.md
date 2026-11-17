# Tasks

## 1. The read check

- [ ] 1.1 Read one webpage on dev and one published webpage on prod through the `readResourceContent` and `readPublishedResourceContent` procedures, called on a tRPC caller as `createResourceProcedures.test.ts` does, and record the outcome here. Verify: both parse and return the page, with the owner's read and the public read both succeeding, or, if no stored webpage exists, the zero counts are written here.

## 2. The archived tick

- [ ] 2.1 The owner decides whether the archived change's task 3.1 stays ticked, reading its Result's "no stored page" as the true state, or is shown unticked here with a note. Verify: the decision is written into this change's Result, and the archive is left as it is.

## Result

No read has run. The zero counts for dev and prod come from the archived backfill's Result, not from a query in this change, and neither procedure was called, so 1.1 stays open with its blocker until a session with the dev and prod access runs it. The session's reading is that the archived change's task 3.1 stays ticked, since its Result already states that no stored page existed; that is a recommendation only. The owner's decision on 2.1 is not recorded here, so 2.1 stays open, and the archive is left as it is.
