# Survey Theme And Files

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

A survey carries an owner's identity: a logo, a colour, a background, and images in its questions and choices. SurveyJS's theme editor and file hooks provide them. The replacement keeps the identity an owner needs and the file ownership rules, and drops the theme editor's full range, which the app's design styles already cover.

## What Changes

- A theme subset on the survey's root props: a logo, an accent colour, a background colour, progress bar and question numbering, applied by the runner and the Creator's preview.
- Uploads for the logo, an image question and an image picker's choices, through the resource's file assets.
- A rule that a file no longer referenced by the document is deleted when the editor closes, so an upload that was removed leaves no orphan.

## Capabilities

- **resource/survey-theme-files** (new): the accent and background apply to the respondent page in both styles, and a file removed from the survey is deleted.
