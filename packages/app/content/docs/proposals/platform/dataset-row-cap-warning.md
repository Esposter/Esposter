---
title: Dataset Row-Cap Warning
description: Surface "showing N of M rows" when a dataset read hits the 1000-row AZURE_MAX_PAGE_SIZE cap instead of silently truncating.
---

# Dataset Row-Cap Warning

When `dataset.readDataset` hits the `AZURE_MAX_PAGE_SIZE` (1000) row cap — used consistently by every provider — every consumer currently renders the truncated data as if it were complete: a real survey can silently lose responses in a bound dashboard or a personalized email export. This proposal makes truncation visible everywhere, without building [pagination](/docs/platform/deferred/dataset-row-cap-pagination).

## Scope

**Today**: `Dataset` carries columns + rows; providers slice to the cap and discard the total. **This proposal adds** truncation metadata and a warning surface per consumer. No new procedures, no schema changes — one model field plus provider and consumer touches.

## How it works

- `Dataset` gains `totalRows?: number` — set by a provider when it knows the uncapped count (SurveyResponses: the partition query count; File: `content.data.rows.length`). `rows.length < totalRows` ⇒ truncated.
- Consumers surface it:
  - **Dashboard visual**: a footnote on the bound visual — "Showing 1000 of {M} rows" (warning icon, tooltip explains the cap).
  - **Survey Responses blade**: a banner above the table.
  - **Email personalized export**: a confirm dialog before export — "{M − N} rows will not get an email" — so partial sends are a decision, not an accident.
  - **File import** (dataset copy path): the 5-row preview notes the capped total.

## Key files

| File                                                        | Role                 |
| ----------------------------------------------------------- | -------------------- |
| `app/shared/models/dataset/Dataset.ts`                      | `totalRows` field    |
| `server/services/dataset/` providers                        | populate `totalRows` |
| `app/components/Resource/Dashboard/Editor.vue` + `View.vue` | visual footnote      |
| `app/components/Resource/Survey/Responses.vue`              | truncation banner    |
| `app/services/emailEditor/exportPersonalizedHtml.ts`        | pre-export confirm   |

## Notes

- Deliberately metadata-only: the fix for actually needing more rows is the deferred pagination page, and this warning is its explicit revisit signal — once users see "of M" and complain, pagination has its consumer.
- Providers that can't cheaply count (none today) may omit `totalRows`; consumers only warn when it is present and larger than `rows.length`.
