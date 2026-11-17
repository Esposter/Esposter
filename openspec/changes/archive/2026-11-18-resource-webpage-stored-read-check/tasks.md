# Tasks

## 1. The read check

- [x] 1.1 Read one webpage on dev and one published webpage on prod through the `readResourceContent` and `readPublishedResourceContent` procedures, called on a tRPC caller as `createResourceProcedures.test.ts` does, and record the outcome here. Verify: both parse and return the page, with the owner's read and the public read both succeeding, or, if no stored webpage exists, the zero counts are written here.

## 2. The archived tick

- [ ] 2.1 The owner decides whether the archived change's task 3.1 stays ticked, reading its Result's "no stored page" as the true state, or is shown unticked here with a note. Verify: the decision is written into this change's Result, and the archive is left as it is.

## Result

The read had no page to read: dev and prod each hold zero webpage resources and zero webpage publications, so neither procedure was called. The session's reading is that the archived change's task 3.1 stays ticked, since its Result already states that no stored page existed; that is a recommendation only. The owner's decision on 2.1 is not recorded here, so 2.1 stays open, and the archive is left as it is.
