# Survey Removal

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

Once the respondent page and the Creator run on the typed document, SurveyJS has no reader left, and the stored surveys in its string shape are unreadable by the new schema. This part deletes the stored surveys, removes the four packages and their wiring, and sweeps the prose that names them.

## What Changes

- The one-time purge deletes every stored survey through the per-resource purge, then the invites that name one.
- SurveyJS's four packages, its two plugins, its chunk entries and its ledger rows are removed.
- The old survey capability folders are replaced by the new capabilities, written as built.

This is a one-time removal with no behaviour of its own, so it carries no spec delta.
