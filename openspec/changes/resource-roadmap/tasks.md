# Resource roadmap

Every product is already a resource behind one [explorer](../../specs/resource/explorer/design.md), whose shell has closed its gap with the Azure portal; what is open now is the depth of each type against the product that already solved its domain — Microsoft To Do for the TodoList, Google Forms for survey responses, Notion for the Note, Power BI for the Dashboard, Mailchimp for the Email, Webflow for the Webpage, Qualtrics' distributions for the Program and the Azure portal's template deployment for the Blueprint. Items link their full specs under [proposals](../) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](../../deferred/resource/) + [rejected](../../rejected/resource/) before adding items, and the [sheet editor](../../specs/resource/sheet/README.md)'s own pair for anything inside the Data blade — the grid keeps its backlog with the editor. New Azure services are the only real cost anywhere below; the SurveyJS Creator licence that [paid storage tiers](../../deferred/resource/paid-storage-tiers/design.md) would have owed goes with SurveyJS when the [survey form engine](../resource-survey-form-engine/design.md) replaces it; everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] [Survey form engine](../resource-survey-form-engine/design.md) — replace SurveyJS with a typed survey document, a runner and a Creator of our own, removing the old survey type's stored data after the owner confirms its counts

- [ ] [AI-native resources](../archive/2026-10-25-architecture-ai-native-resources-program/design.md) — beyond the content tools every type has, an open editor adopting an agent's save, the lifecycle as tools, the schema fixes and typed commands, wired once at the resource layer rather than per editor

- [ ] [Browser suite for the resource editors](../../specs/resource/whiteboard/design.md) — a package browser suite, since layout claims wait for one (the `testing` skill): the whiteboard canvas and PNG export, the Note image width cap, and the page builder's colour probe on a non-sRGB colour, none of which happy-dom can show

## Later

- [ ] [Flowchart removal's client delta](../archive/2026-11-02-resource-flowchart-retirement/proposal.md#bundle-measurement) — measure the client bytes the removal released against the last release before it. The archived change's task 3.5 is ticked, but its proposal records only the built size of the five Vue Flow packages, a ceiling, so the exact delta is not on record; this item measures it, or the owner accepts the ceiling as the figure

- [ ] [Page builder](../resource-page-builder-program/design.md) — the Webpage and Email editors rebuilt on a typed node tree and MJML on the server, with GrapesJS and its plugin belt removed in one cutover; it replaces the plugin-belt pruning, which stops now — the cutover, email and style-panel changes are archived, while the canvas and performance-and-proof changes are archived with tasks still open, and the program's own tasks 3.1 and 4.1 stay open until they close
