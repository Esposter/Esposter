# The Resolved-Config Snapshot

Read when `uno.config.test.ts` fails, most of all after an `unocss` bump.

`apps/web/uno.config.test.ts` snapshots the resolved configuration.

**It is not there to restate what the config file sets** — that would fail only on a deliberate edit, where the
diff is already the review. It is there for the edit nobody makes: **an `unocss` bump**. The snapshot captures
_resolved_ output — what the preset fills in around our entries — so an upstream release can move it with no diff
anywhere in this repo and nothing else in the suite would notice. That is the "a literal fixed outside this repo"
case the `testing` skill carves out, and it is why a version bump is the review that matters for this file.

So the diff on a dependency update is the finding, not noise: read it before regenerating, and say in the commit
what upstream changed. Regenerate after an intentional change of our own:

```bash
pnpm test uno.config.test.ts -u --run
```
