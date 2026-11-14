# Builders and publishing

Read when a dataset's builder is written, proven with `--dry-run`, or published.

The one-line rules are in `SKILL.md`; this page is their reasoning.

## Keys

A record the code names by itself gets its own key (`stats/weapons`), and a set read one entity at a time is an index by id (`profile/<Language>`).

## Proving a builder

A path `removed` across many rows is a field the source stopped writing, never new content, so it is fixed before the publish. A real publish that stores needs the R2 credentials `scripts/src/services/cloudflare/createR2Transport.ts` reads (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `CLOUDFLARE_ACCOUNT_ID`), writes the lock only once both environments' buckets hold every object, and the lock is committed at once with the publish's report in its body. A real publish with nothing to store and the lock unchanged returns before any bucket is listed, so it needs no credentials. A publish the R2 API refuses with a 403 means the key pair lacks access to the bucket, and the fix is that key pair's scope in Cloudflare, never a change to the publish.
