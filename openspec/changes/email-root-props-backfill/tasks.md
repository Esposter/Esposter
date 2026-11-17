# Tasks

## 1. The stored emails

- [ ] 1.1 Dry-run a scan of the email working copies for a root props object lacking `lang` or `title`, and count the rows it would rewrite. Verify: the dry run's count is written into this change before the dev run.
- [ ] 1.2 Check the published versions of emails for the old shape, per the persisted-stores reference, and raise any found with the user before the prod run.
- [ ] 1.3 Rewrite the dev working copies, setting the missing `lang` and `title` to an empty string, then re-run until the scan reports nothing. Verify: `readResourceContent` with the email content schema parses each rewritten email on dev.
- [ ] 1.4 Run the same rewrite on prod straight after dev, re-run until the scan reports nothing, then delete the script.
