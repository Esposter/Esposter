# The run

Read when running a backfill: writing its scratchpad script, the dry run, the dev-then-prod order and the re-run.

1. **Write the script in the scratchpad**, resolving `@azure/storage-blob` from a workspace package with `createRequire`. It walks each store, decodes each document, removes or reshapes the slots by the _shape of the object holding them_ (the keys that identify an item, a todo, a program) — never by key name alone, since a sheet cell can be named anything — and re-encodes only the documents it changed.
2. **Upload with `ifMatch` on the listed etag**, so a user's save landing mid-run wins and the document is simply retried on the next run.
3. **Get the connection string from the Azure CLI** — `az storage account show-connection-string -n <account> -g <group>`; the accounts are `devstesposter001` and `prodstesposter001`.
4. **Dry run, then write, on dev.** The dry run prints each document and slot count; the write run follows.
5. **Prod straight after dev, without waiting for the deploy**, the window `SKILL.md`'s settled list accepts.
6. **Re-run until it reports nothing to change**, so a document skipped by a conflicting save is caught.
7. **Delete the script.** Report the counts per store.
