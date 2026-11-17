# Tasks

## 1. The read check

- [x] 1.1 Read one webpage on dev and one published webpage on prod through the `readResourceContent` and `readPublishedResourceContent` procedures, called on a tRPC caller as `createResourceProcedures.test.ts` does, and record the outcome here. Verify: both parse and return the page, with the owner's read and the public read both succeeding, or, if no stored webpage exists, the zero counts are written here.

## 2. The archived tick

- [x] 2.1 Decide whether the archived change's task 3.1 stays ticked, reading its Result's "no stored page" as the true state, or is shown unticked here with a note. Verify: the decision is written into this change's Result, and the archive is left as it is.

## Result

The read had no page to read. This change queried both databases through the Cloudflare D1 query API, with the account token the `esposter-infra/prod` ESC environment holds: `SELECT (SELECT count(*) FROM resource_resources WHERE type='Webpage'), (SELECT count(*) FROM resource_resourcePublications)` answered zero and zero on the dev database and zero and zero on the prod database. With no webpage and no publication stored in either, neither procedure has a row to read, so 1.1 is closed by the zero counts its Verify names.

The archived change's task 3.1 stays ticked. Its Result already says no stored page existed, which these queries confirm is the true state, so the tick and the Result agree, and the archive is left as it is. The choice is the session's, under the `throughput` skill's "Decide, don't ask": it has a recommended option and is on none of that section's user-only list.
