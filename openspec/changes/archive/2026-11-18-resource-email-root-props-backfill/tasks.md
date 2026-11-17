# Tasks

## 1. The stored emails

- [x] 1.1 Dry-run a scan of the email working copies for a root props object lacking `lang` or `title`, and count the rows it would rewrite. Verify: the dry run's count is written into this change before the dev run.
- [x] 1.2 Check the published versions of emails for the old shape, per the persisted-stores reference, and raise any found with the user before the prod run. Verify: the published-versions check's row count, zero or each row raised, is written into this change before the prod run.
- [x] 1.3 Rewrite the dev working copies, setting the missing `lang` and `title` to an empty string, then re-run until the scan reports nothing. Verify: `readResourceContent` with the email content schema parses each rewritten email on dev.
- [x] 1.4 Run the same rewrite on prod straight after dev, re-run until the scan reports nothing, then delete the script.

## Result

The scan found no email in either database: dev and prod each hold zero email resources and zero email publications, so the dry run counted zero rows, the published-versions check counted zero, nothing was written, and no script was kept.
