# Program link expiry

A personal link that stops working after a time, sixty days by default or the survey's own expiry, as Qualtrics's personal links do ([Personal Links](https://www.qualtrics.com/support/survey-platform/distributions-module/email-distribution/personal-links/)).

## Why deferred

A survey stops taking responses by its **Accepting responses** switch, which the owner turns off and which closes every invite link at once ([response controls](../../../specs/resource/survey-response-controls/design.md)), and it has no date on which it closes by itself. A link expiry would be a second clock beside a survey that has none, and a token that dies while the survey is open leaves a participant with a link that neither works nor says why.

## Revisit when

A survey can close on a date, so one date ends the survey and its links together, or an owner finds old links still answering a survey they meant to be over.
