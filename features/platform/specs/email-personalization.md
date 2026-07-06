# Platform — Email Personalization

The email editor joins the data flow: merge-field blocks bound to a `DatasetReference`, survey invite blocks, and per-row personalized HTML export — applying the datasets standard to the email product. Actually sending email stays deferred ([deferred/email-sending.md](../deferred/email-sending.md)).

## Overview

An email document optionally binds one dataset (`EmailEditor.datasetReference`). The bound dataset's columns appear in the block manager as drag-in merge-field blocks (`{{columnName}}`), and the owner's published surveys appear as styled invite-button blocks linking to their public fill page. Export compiles the current MJML to HTML once (`mjml-get-code`), then writes one personalized `.html` per dataset row with merge fields substituted.

## Data Model Changes

- `EmailEditor.datasetReference?: DatasetReference` — stored inside the email document content; every GrapesJS save carries it over since project data doesn't know about it. No DB changes, no new procedures — binding resolves through `dataset.readDataset`.

## Components

- `EmailEditor/Header.vue` — `DocumentPicker` + shared `Dataset/ReferencePicker` + export button, mounted above the GrapesJS canvas
- `EmailEditor/ExportPersonalizedHtmlButton.vue` — readDataset → downloads one `.html` per row via the shared `downloadFile` helper (anchor-based blob download)

## Key Files

| File                                                | Role                                                            |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `app/services/emailEditor/toMergeField.ts`          | canonical `{{columnName}}` token                                |
| `app/services/emailEditor/substituteMergeFields.ts` | per-row substitution, HTML-escaped                              |
| `app/services/grapesjs/setBlocks.ts`                | wholesale block-category re-sync in the block manager           |
| `app/composables/grapesjs/useGrapesJsEditor.ts`     | shared GrapesJS init + document storage adapter (email/webpage) |

## Constraints / Notes

- Merge-field and survey-invite blocks re-sync whenever their reactive source changes (bound dataset columns, published surveys) — categories are replaced wholesale, no per-block bookkeeping.
- Substituted values are HTML-escaped: merge fields personalize text, they never inject markup. Tokens are inserted escaped and substitution matches both raw and escaped token forms, since the canvas entity-encodes special characters (e.g. a "P&L" column) on serialization.
- Export is fully client-side; a zip dependency was rejected in favour of the File System Access directory picker.
