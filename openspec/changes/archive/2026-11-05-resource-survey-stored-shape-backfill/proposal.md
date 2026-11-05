# Survey stored-shape backfill

Two renames in the survey document moved fields that stored surveys already carry, and no stored survey has been rewritten to match.

## Why

The survey document's root props renamed `showQuestionNumbers` to `isQuestionNumbersVisible`, and the slider node's props renamed `showValue` to `isValueVisible`. The root props schema is strict, so a stored survey still holding the old root key fails to parse and the survey resource refuses the whole document. The slider schema is not strict, so a stored `showValue: false` is dropped and the default `true` applies: the runner shows a value the author hid.

Both commits reached `main`, so a survey saved in the window between the flag and its rename may exist in production. The repository cannot say whether one does.

## What Changes

- A one-off backfill, run as the `backfills` skill describes, rewrites each stored survey's `content.json` working copy: the root's `showQuestionNumbers` becomes `isQuestionNumbersVisible` with its value, and each slider node's `showValue` becomes `isValueVisible` with its value. The old keys are removed.
- The script is a scratchpad and is never committed. Nothing in the app reads the old keys, so no read path is added.
- Published versions are not rewritten. A version taken before the backfill fails to restore, the accepted cost named in the persisted-data design.

## Capabilities

No spec delta. The rule the backfill applies is stated in [persisted data, latest shape only](../../../specs/architecture/persisted-data-latest-shape-only/design.md); this change only runs it.
