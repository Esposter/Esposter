# Renaming, re-parenting and importing resources

Read when changing the `parent` of an already-deployed resource, renaming or replacing one, when a review suggests adding an `alias`, or when importing an existing Azure resource with `pulumi import --generate-code`.

## Re-parenting already-deployed resources

Changing `parent` in code changes the Pulumi URN (old = delete, new = create). `protect: true` blocks the delete, so the preview errors. Sequence:

1. Update `parent` in code to the correct final parent.
2. `pulumi state unprotect "<old-urn>"` for each affected resource — allows Pulumi to delete the old state entry.
3. `pnpm infra:preview` — confirm the plan shows delete (old URN) + create (new URN) per affected resource, plus any net-new creates.
4. `pnpm infra:up` — Pulumi deletes old state entries and creates resources under the new parent URN. The Azure resources themselves aren't deleted; only the state tree changes unless properties also changed.

## Renames

During naming migration waves, prefer create/cutover/delete over aliases for resources whose final shape should also gain a `parent`. New target resources include the best parent from the start whenever the Azure hierarchy makes that natural.

**When the final Azure name matches the legacy name** (e.g. event subscriptions reused under a new topic), there is no `New` suffix in the final code. The sequence depends on whether the resource holds data to migrate:

- **No external data** (event subscriptions, role assignments): unprotect old → delete old file → create new file with the final name → a single `pulumi up` deletes old and creates new. The old Azure resource is deleted automatically when the file is removed.
- **External data to migrate** (storage accounts, search indexes): two-phase create/cutover/delete — (1) create the new resource under a temporary name, migrate data, cut the app over, then (2) delete the old → rename the new to the final name → second cutover. Never leave a `New`-suffixed resource file permanently in the codebase.

## Why the alias ban is unconditional

The Pulumi logical name **is** the Azure resource name here (the constructor's first argument, matching the `name` property — never the export constant), which leaves no case an alias could serve:

- **The `name` property changed** — the URN changed with it, and an alias only remaps the URN, so it cannot prevent the replacement; under the new name it is genuinely a different Azure resource.
- **Only the export/file name changed** — the URN never moved, so there is nothing for an alias to remap.

The fix for a wrong name is a correct name, applied through the sequences above, not a compatibility shim carried forever.

**Close the suggestion on evidence, not on the diff.** Reviewers raise it repeatedly (reasoning from the rename diff, re-flagging on every PR that carries the renamed file, often as a critical "protected resource replacement" outside-diff comment). Run `pnpm infra:preview` and read the plan: an applied rename shows as `unchanged` / `0 to replace`, and that line is what to paste. A preview showing a pending replacement means the migration is unfinished — finish the cutover, still without an alias. Claiming a replacement will or won't happen without a preview to back it is itself a false positive.

## Import output is throwaway

`pulumi import --generate-code` output, discovery scripts and `import.json` are throwaway: write them to the session scratchpad, never the repo. Import output may contain live callback URLs, signatures and webhook secrets. Refactor the relevant resources into `src/<provider>/` by hand, then discard the generated file.
