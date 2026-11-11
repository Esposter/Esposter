## Why

A participant is either responded or not, so a person who answered half the survey looks the same as one who never opened the link. The owner choosing whom to remind cannot tell them apart, and the funnel cannot show where people stop. The reference reports each personal link as started or finished.

## What Changes

- The Status blade shows each participant as not started, started or finished, and the meter counts finished ones as it counts responded ones today.
- A participant is started when the survey holds a saved draft for their token and no submitted response.
- The `ProgramStatus` dataset gains a `started` column beside `responded`, so a dashboard can chart the funnel's middle.
- Export reminders keeps reaching everyone who has not finished, which includes those who started.

## Capabilities

### Modified Capabilities

- program-resource (resource/program-resource): the status distinguishes a participant who has started from one who has not and from one who has finished.

## Impact

The status join reads the drafts the respondent page already saves per token, which it matches the way it matches submitted responses. The Status blade gains a column and the dataset one column. Nothing is stored, and a draft that is later submitted counts as finished and no longer as started.
