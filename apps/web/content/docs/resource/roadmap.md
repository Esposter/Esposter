---
title: Roadmap
description: Open resource work — the prioritized index over the proposal specs.
---

# Resource roadmap

Every product is already a resource behind one [explorer](/docs/resource/explorer), whose shell has closed its gap with the Azure portal; what is open now is the depth of each type against the product that already solved its domain — Microsoft To Do for the TodoList, the ISO flowchart palette for the Flowchart, Google Forms for survey responses, Notion for the Note, Power BI for the Dashboard, Mailchimp for the Email, Webflow for the Webpage, Qualtrics' distributions for the Program and the Azure portal's template deployment for the Blueprint. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/resource/deferred) + [rejected](/docs/resource/rejected) before adding items, and the [sheet editor](/docs/resource/sheet)'s own pair for anything inside the Data blade — the grid keeps its backlog with the editor. New Azure services and the SurveyJS Creator licence are the only real costs anywhere below; everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] Decide the Survey editor's licence — the Editor blade embeds SurveyJS Creator (`survey-creator-vue`), which [SurveyJS licenses](https://surveyjs.io/licensing) commercially per developer, and the repo sets no licence key; buy one, or replace the Creator with an authoring surface of our own over the MIT form library. A product question before an engineering one
- [ ] [TodoList to a todo product](/docs/proposals/resource/todo-list) — task rows, completion, quick add, importance and manual order have shipped; build the rest in the spec's order:
  - [ ] [Steps](/docs/proposals/resource/todo-list/steps) — a flat checklist inside a todo, counted on its row
  - [ ] [Print list](/docs/proposals/resource/todo-list/print-list) — To Do's Print list, with the notes and steps as toggles
  - [ ] [Recurrence](/docs/proposals/resource/todo-list/recurrence) — completing a repeating todo rolls it to its next due date
- [ ] [Flowchart shapes](/docs/proposals/resource/flowchart-shapes) — the standard flowchart symbols instead of one rectangle, four handles each, labels edited in place
- [ ] [Flowchart connectors](/docs/proposals/resource/flowchart-connectors) — arrowheads, right-angled paths, edge labels and a panel for a selected edge
- [ ] [Dashboard live canvas](/docs/proposals/resource/dashboard-live-canvas) — the editor draws each tile as its real visual over its bound data instead of a stock icon, so a dashboard is seen without publishing it
- [ ] [Dashboard duplicate visual](/docs/proposals/resource/dashboard-duplicate-visual) — Duplicate on a tile's corner copies its chart settings and binding
- [ ] [Dashboard card and table visuals](/docs/proposals/resource/dashboard-card-and-table-visuals) — a single aggregated number and a table of exact values beside the charts, over the same binding
- [ ] [Survey response summary](/docs/proposals/resource/survey-response-summary) — a Summary tab of one chart or list per question, computed from the responses already read
- [ ] [Dataset CSV export](/docs/proposals/resource/dataset-csv-export) — one Export CSV for every dataset provider without an export of its own, survey responses first, answers neutralised as formulas
- [ ] [Email preview text](/docs/proposals/resource/email-preview-text) — the inbox line under the subject, written into the MJML as its `mj-preview`
- [ ] [Webpage form blocks](/docs/proposals/resource/webpage-form-blocks) — stop offering form blocks, whose forms the published page's sandbox can never submit; the types stay so saved forms still load
- [ ] [Webpage social preview](/docs/proposals/resource/webpage-social-preview) — a description and share image the published page unfurls with
- [ ] [Program survey mode check](/docs/proposals/resource/program-survey-mode-check) — warn when the bound survey is Anonymous, which drops every participant token
- [ ] [Program email invites](/docs/proposals/resource/program-email-invites) — the bound email exported per participant with their tokened link, and again for those still awaiting
- [ ] [Blueprint deploy review](/docs/proposals/resource/blueprint-deploy-review) — the Deploy dialog lists every resource it will create under its resolved name before creating any
- [ ] [Note images](/docs/proposals/resource/note-images) — upload, paste or drop an image into a Note as its own file asset, with alt text; the published view draws only asset urls
- [ ] [Note tables](/docs/proposals/resource/note-tables) — Notion's simple table: text cells, a header row, and a table menu for rows and columns
- [ ] [Note slash menu](/docs/proposals/resource/note-slash-menu) — `/` opens a filterable block menu at the caret
- [ ] [Note Markdown portability](/docs/proposals/resource/note-markdown-portability) — import and export a Note as a `.md` file
- [ ] [Flowchart image export](/docs/proposals/resource/flowchart-image-export) — Export PNG and Export SVG of the whole diagram

## Later

- [ ] Prune the page-builder plugin belt — absorb the block-registering plugins that are unmaintained or imported through `@ts-expect-error`, keep the engines (the webpage preset, the image editor, the exporter); lowest value per unit of effort in the [dependency admission](/docs/architecture/dependency-admission) analysis, so it goes last
- [ ] [Content-addressed assets](/docs/proposals/resource/content-addressed-assets) — a publish references assets by content instead of cloning them, with reference rows written from a scan of each version's content and a count-but-never-collect period before anything is deleted
- [ ] [Paid storage tiers](/docs/proposals/resource/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
