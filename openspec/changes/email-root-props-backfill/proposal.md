# Email root props backfill

## Why

Commit `b3f5b82421` made `lang` and `title` required in `mjmlRootPropsSchema` (`packages/mjml-blocks/src/services/mjmlRootPropsSchema.ts`), since the model documents an empty string as "not set". An email saved before that commit may store its root props as `{}`, which no longer parses: `readResourceContent` calls `contentSchema.parse` on the working copy, so opening, publishing or sending such an email throws. No backfill of stored email documents shipped with the change.

## What Changes

- Every stored email working copy (`resource-assets`, `{resourceId}/content.json`) whose root props lack `lang` or `title` is rewritten with them set to an empty string, the value the model already means by "not set".
- The backfill is a scratchpad script run per the `backfills` skill: a dry run, then dev, then prod, re-run until it reports nothing, then deleted. It commits nothing.
- A published version of an email whose snapshot holds the old shape is checked before the prod run, per the persisted-stores reference.

## Capabilities

- **resource/email-layout** (changed: no new behaviour, only stored data brought to the schema's shape)

## Waiting on

- Access to the dev and prod D1 and R2 stores. The session that recorded this had no Cloudflare credentials, so it could not scan or rewrite any stored email.

## Impact

Rewrites stored email working copies once, on dev and then prod. No code, schema or spec changes: the schema already describes the one shape the code writes.
