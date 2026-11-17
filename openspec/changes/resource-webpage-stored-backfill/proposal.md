## Why

Two webpage fields became required in the stored shape without a backfill of the content already stored. `isIndexable` on the webpage content (`06d0f6b03d`) and `elementId` on every webpage node (`cc9e03dde7`) are both required by their schemas, so a webpage saved or published before those commits fails to parse on read: the owner cannot open it, and the public published read fails. The schemas stay as they are, since the persisted-data rule forbids a default that papers over a field older data lacks, so the stored documents are what remains to bring to the shape the code reads.

## What Changes

- Rewrite every stored webpage content document that lacks `isIndexable` to carry `true`, the value a new webpage starts on.
- Rewrite every stored webpage node that lacks `elementId` to carry a generated id that takes a node id's characters and length and is unique within its document.
- Rewrite every published webpage snapshot the same way, since a version snapshot is not rewritten and a published page is read from its snapshot.
- Run the one-off script on dev, then on prod, and re-run until it reports nothing to change, per the `backfills` skill. The script is a scratchpad and is not committed.

## Capabilities

None. The specs already state the required shapes; this change brings stored data to them.

## Impact

No application code changes. The schemas already describe the latest shape. The work needs a Cloudflare API token from Pulumi ESC (`CLOUDFLARE_API_TOKEN`), which the session that runs it must hold; it is not present in the settler's environment, so this change is not built by it.
