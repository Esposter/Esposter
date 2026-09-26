---
title: Roadmap
description: Open resource work — the prioritized index over the proposal specs.
---

# Resource roadmap

Every product is already a resource behind one [explorer](/docs/resource/explorer), whose shell has closed its gap with the Azure portal; what is open now is the depth of each type against the product that already solved its domain — Microsoft To Do for the TodoList, the ISO flowchart palette for the Flowchart, Google Forms for survey responses, Notion for the Note. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/resource/deferred) + [rejected](/docs/resource/rejected) before adding items, and the [sheet editor](/docs/resource/sheet)'s own pair for anything inside the Data blade — the grid keeps its backlog with the editor. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] [Large content saves](/docs/proposals/resource/large-content-saves) — a document over the tRPC body limit fails autosave with a connection reset; the ceiling becomes its own cited constant. Build in the spec's order:
  - [ ] [Staged content saves](/docs/proposals/resource/large-content-saves/staged-saves) — a save over the transport limit is gzipped, uploaded to Blob Storage through a reserved SAS and committed by reference; one over the content limit is refused before sending
  - [ ] [Delta content saves](/docs/proposals/resource/large-content-saves/delta-saves) — gated on a measurement after staged saves ship: each save compressed against the stored document as its dictionary
- [ ] Decide the Survey editor's licence — the Editor blade embeds SurveyJS Creator (`survey-creator-vue`), which [SurveyJS licenses](https://surveyjs.io/licensing) commercially per developer, and the repo sets no licence key; buy one, or replace the Creator with an authoring surface of our own over the MIT form library. A product question before an engineering one
- [ ] [TodoList to a todo product](/docs/proposals/resource/todo-list) — the TodoList type has no idea of done. Build in the spec's order:
  - [ ] [Task rows](/docs/proposals/resource/todo-list/task-rows) — rows with a checkbox, title, metadata line and star replace the data table; the one-member item type goes
  - [ ] [Completion](/docs/proposals/resource/todo-list/completion) — tick to complete with a drawn check, a Completed section with completion dates, delete stays in the dialog
  - [ ] [Quick add](/docs/proposals/resource/todo-list/quick-add) — an Add a task field that adds on Enter
  - [ ] [Importance](/docs/proposals/resource/todo-list/importance) — a star and a sort by importance
  - [ ] [Steps](/docs/proposals/resource/todo-list/steps) — a flat checklist inside a todo, counted on its row
  - [ ] [Manual order](/docs/proposals/resource/todo-list/manual-order) — drag or Alt+arrow to reorder open tasks
  - [ ] [Recurrence](/docs/proposals/resource/todo-list/recurrence) — completing a repeating todo rolls it to its next due date
- [ ] [Flowchart shapes](/docs/proposals/resource/flowchart-shapes) — the standard flowchart symbols instead of one rectangle, four handles each, labels edited in place
- [ ] [Flowchart connectors](/docs/proposals/resource/flowchart-connectors) — arrowheads, right-angled paths, edge labels and a panel for a selected edge
- [ ] [Dashboard card and table visuals](/docs/proposals/resource/dashboard-card-and-table-visuals) — a single aggregated number and a table of exact values beside the charts, over the same binding
- [ ] [Survey response summary](/docs/proposals/resource/survey-response-summary) — a Summary tab of one chart or list per question, computed from the responses already read
- [ ] [Survey response export](/docs/proposals/resource/survey-response-export) — Export CSV on the Responses blade, with respondents' answers neutralised as formulas
- [ ] [Note task lists](/docs/proposals/resource/note-task-lists) — checkbox lists in a Note, from `[ ] ` or the menu bar
- [ ] [Note slash menu](/docs/proposals/resource/note-slash-menu) — `/` opens a filterable block menu at the caret
- [ ] [Note Markdown portability](/docs/proposals/resource/note-markdown-portability) — import and export a Note as a `.md` file
- [ ] [Flowchart image export](/docs/proposals/resource/flowchart-image-export) — Export PNG and Export SVG of the whole diagram

## Later

- [ ] Prune the page-builder plugin belt — absorb the block-registering plugins that are unmaintained or imported through `@ts-expect-error`, keep the engines (the webpage preset, the image editor, the exporter); lowest value per unit of effort in the [dependency admission](/docs/architecture/dependency-admission) analysis, so it goes last
- [ ] [Content-addressed assets](/docs/proposals/resource/content-addressed-assets) — a publish references assets by content instead of cloning them, with reference rows written from a scan of each version's content and a count-but-never-collect period before anything is deleted
- [ ] [Paid storage tiers](/docs/proposals/resource/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
