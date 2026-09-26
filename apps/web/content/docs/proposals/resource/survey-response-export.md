---
title: Survey response export
description: Proposal — an Export CSV action on the Responses blade downloads every response with question titles as headers, through the CSV quoting the Sheet export already uses, with respondents' answers neutralised as formulas.
model: claude-opus-5-5
---

# Survey Response Export

Responses live in the Responses blade and in the survey's dataset, which a Sheet can import and a Dashboard can bind ([datasets](/docs/architecture/dataset)). What a survey owner reaches for first — a file of the answers to open in Excel or send on — is not there. Google Forms puts **Download responses (.csv)** in the response page's own menu.

## What it adds

The Individual table's toolbar gains an overflow action, **Export CSV**, beside the resource list's own Export CSV in wording and placement ([list filters & views](/docs/resource/list-filters-and-views)).

- **Columns** are the submission time, then one per question in the survey's order, headed by the question **title** rather than its internal name; a checkbox question's answers join into one cell separated by `; `. In an Identified survey the respondent column comes first ([survey response modes](/docs/resource/survey-response-modes)).
- **Rows** are every response the blade has read. A survey over the dataset row cap exports what was read and says so in the same warning the blade shows, rather than implying the file is complete ([dataset row-cap warning](/docs/resource/dataset-row-cap-warning)).
- **Serialization** goes through `escapeCsvCell`, the quoting the Sheet's CSV export and the list's `getResourcesCsv` already share. The file is named after the survey.
- **Answers are neutralised as formulas.** Every other CSV the app writes holds the owner's own text; this one holds text typed by anonymous respondents on a public page, opened by the owner in a spreadsheet. A cell starting with `=`, `+`, `-`, `@`, a tab or a line break is a formula to Excel, so each answer cell is quoted with a tab placed before such a first character — the one mitigation OWASP reports surviving an Excel save and reopen. It lands as a sibling of `escapeCsvCell` for untrusted cells, not a change to it, since a Sheet export must round-trip the owner's own formulas-as-text unchanged.

No procedure is added: the export is a client transform of the records `survey.readSurveyResponseRecords` returns.

## What is deliberately not in it

- **Not a Portable format on the survey.** Portable import and export move the survey's _content_ — its model — and a response file is not the resource. It sits on the blade that owns the responses.
- **No live-synced spreadsheet** (Google Forms' linked Sheet). A Sheet can import the survey's dataset today; a live link is [realtime dataset refresh](/docs/resource/deferred/realtime-dataset-refresh).

## Key files

| File                                                        | Role after the change                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/web/app/components/Resource/Survey/Responses.vue`     | the Export CSV action                                      |
| `apps/web/app/services/resource/sheet/csv/escapeCsvCell.ts` | the quoting it reuses, beside a new untrusted-cell sibling |

## Sources

- [Google Forms Help — view and manage form responses](https://support.google.com/docs/answer/139706) — downloading all responses as a CSV from the response page's menu.
- [OWASP — CSV injection](https://community.owasp.org/attacks/CSV_Injection) — the formula trigger characters and the tab-inside-quotes prefix that survives Excel re-saving.
