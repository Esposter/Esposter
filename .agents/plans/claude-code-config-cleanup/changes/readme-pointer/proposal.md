## Why

`README.md` is 2,920 words and restates content that other files own: the layer table repeats `AGENTS.md` and `CLAUDE.md`; the workflow and stage tables repeat the `openspec` skill and the `spec`, `build`, `gate` and `ship` skills; the skill tables repeat each skill's frontmatter description; the hook list repeats `hooks.json` and the Verify-Config roster. Each copy drifts from its owner. The docs are read by agents, not people, so the README's job is to point, not to explain.

## What Changes

- Reduce the README to an index: one line per owning file, and the install block a person runs.
- Remove each restated table or list whose owner is named in the index, and keep the owner's text as the only copy.
- Keep the third-party notices and the MIT text verbatim. The licence obligation travels with the repository and cannot be replaced by a pointer.
- Keep the Quick Start commands, since a person runs them.

## Capabilities

### New Capabilities

- `contract-docs`: each fact about the team setup has one owning file, and the README indexes those files without restating them.

### Modified Capabilities

- none

## Impact

- `README.md` only. No behaviour changes; Verify-Config's README checks are updated to the new index.
