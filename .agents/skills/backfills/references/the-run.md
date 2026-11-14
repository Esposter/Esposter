# The run

Read when running a backfill: writing its scratchpad script, the dry run, the dev-then-prod order and the re-run.

1. **Write the script in the scratchpad.** It reads each D1 row of the store it is rewriting from the `core` database, and each R2 object from its bucket under the name `getR2BucketName` builds (`packages/db/src/services/storage/getR2BucketName.ts`). It decodes each document, removes or reshapes the slots by the _shape of the object holding them_ (the keys that identify an item, a todo, a program) — never by key name alone, since a sheet cell can be named anything — and re-encodes only the documents it changed.
2. **Write each change guarded by what it read**, so a user's save landing mid-run wins and the document is simply retried on the next run. A D1 row is an `UPDATE … WHERE id = ? AND updatedAt = ?` on the `updatedAt` it read. An R2 object is a conditional write on the etag it listed.
3. **Get the credentials from Pulumi ESC**, not from a file. The script reads the account and token from the names `packages/db-schema/drizzle.config.ts` reads — `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` — and `CLOUDFLARE_ENVIRONMENT` picks the database the same way it does for `db:migrate`.
4. **Dry run, then write, on dev.** The dry run prints each document and slot count; the write run follows.
5. **Prod straight after dev, without waiting for the deploy**, the window `SKILL.md`'s settled list accepts.
6. **Re-run until it reports nothing to change**, so a document skipped by a conflicting save is caught.
7. **Delete the script.** Report the counts per store.
