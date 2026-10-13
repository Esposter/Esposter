---
title: Roadmap
description: Open resource work — the prioritized index over the proposal specs.
---

# Resource roadmap

Every product is already a resource behind one [explorer](/docs/resource/explorer), whose shell has closed its gap with the Azure portal; what is open now is the depth of each type against the product that already solved its domain — Microsoft To Do for the TodoList, the ISO flowchart palette for the Flowchart, Google Forms for survey responses, Notion for the Note, Power BI for the Dashboard, Mailchimp for the Email, Webflow for the Webpage, Qualtrics' distributions for the Program and the Azure portal's template deployment for the Blueprint. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/resource/deferred) + [rejected](/docs/resource/rejected) before adding items, and the [sheet editor](/docs/resource/sheet)'s own pair for anything inside the Data blade — the grid keeps its backlog with the editor. New Azure services are the only real cost anywhere below, besides the SurveyJS Creator licence that [paid storage tiers](/docs/proposals/resource/paid-storage-tiers) would owe by ending its [open-source exception](/docs/resource/rejected/survey-creator-licence); everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] [AI-native resources](/docs/proposals/architecture/ai-native-resources) — beyond the content tools every type has, an open editor adopting an agent's save, the lifecycle as tools, the schema fixes and typed commands, wired once at the resource layer rather than per editor
- [ ] [Flowchart shapes](/docs/proposals/resource/flowchart-shapes) — the standard flowchart symbols instead of one rectangle, four handles each, labels edited in place
- [ ] [Dashboard live canvas](/docs/proposals/resource/dashboard-live-canvas) — the editor draws each tile as its real visual over its bound data instead of a stock icon, so a dashboard is seen without publishing it
- [ ] [Dashboard card and table visuals](/docs/proposals/resource/dashboard-card-and-table-visuals) — a single aggregated number and a table of exact values beside the charts, over the same binding
- [ ] [Dataset CSV export](/docs/proposals/resource/dataset-csv-export) — one Export CSV for every dataset provider without an export of its own, survey responses first, answers neutralised as formulas
- [ ] [Program survey mode check](/docs/proposals/resource/program-survey-mode-check) — warn when the bound survey is Anonymous, which drops every participant token
- [ ] [Program email invites](/docs/proposals/resource/program-email-invites) — the bound email exported per participant with their tokened link, and again for those still awaiting
- [ ] [Note images](/docs/proposals/resource/note-images) — upload, paste or drop an image into a Note as its own file asset, with alt text; the published view draws only asset urls
- [ ] [Note tables](/docs/proposals/resource/note-tables) — Notion's simple table: text cells, a header row, and a table menu for rows and columns
- [ ] [Note Markdown portability](/docs/proposals/resource/note-markdown-portability) — import and export a Note as a `.md` file
- [ ] [Flowchart image export](/docs/proposals/resource/flowchart-image-export) — Export PNG and Export SVG of the whole diagram

## Later

- [ ] [Page builder](/docs/proposals/resource/page-builder) — the Webpage and Email editors rebuilt on a typed node tree and MJML on the server, with GrapesJS and its plugin belt removed in one cutover; it replaces the plugin-belt pruning, which stops now
- [ ] [Content-addressed assets](/docs/proposals/resource/content-addressed-assets) — a publish references assets by content instead of cloning them, with reference rows written from a scan of each version's content and a count-but-never-collect period before anything is deleted
- [ ] [Paid storage tiers](/docs/proposals/resource/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
