# Where Good Layout Is Looked Up, Not Improvised

Read when laying out a new surface or a new product page, or when judging whether one looks right. The placement rules are in `SKILL.md`, component choice in `ui-library`, and the utilities in `styling`. This page is where the look itself comes from. A layout composed from memory, one component at a time, reads as a stack of parts, even when every part follows its rule.

## Look it up first, every time

The full list of sources, with what each gave the app and the order they are consulted in, is `apps/web/content/docs/architecture/design-sources.md`. The three below are the ones every layout starts from.

- **The reference product's own screen.** Before writing a template, find how the product the feature is modelled on arranges the same data, and match its hierarchy: what is large, what recedes, what sits in the margin. The messaging surfaces follow Discord and Slack (`SKILL.md`). The agent console is the exception: a game held in the voxel style and dusk, so it is not held to the app's page layouts. Its panel column still keeps the Claude desktop app's Code tab and T3 Code hierarchy — one conversation column, the composer pinned under it — and the rest is its own voxel world page (`apps/web/content/docs/infra/claude-interface/agent-console/voxel-world.md`).
- **The design language.** `apps/web/content/docs/architecture/design-language.md` is how the app's own interface looks: the type scale, the spacing step, when a surface is lifted or raised, and how dense a list may get. A layout is composed from its surfaces and type rules, and what exists to compose it from is the components section of `apps/web/content/docs/architecture/ui-library.md`.
- **The sources it draws on**, in `apps/web/content/docs/architecture/design-sources.md`, for the question the design language does not answer yet — and the answer found there is written back into it.

## What a first draft gets wrong

Each of these is a finding in review, whatever the rules above say about the parts.

- **Everything boxed.** Borders, cards, chips and expansion panels on every item flatten the hierarchy until nothing leads. Group with space and type roles first, and give a surface to the one region that needs it.
- **Chips as labels.** A chip is a control or a count. A state or a figure beside a title is text in a lower-emphasis role.
- **Full-width reading text.** Prose wider than about seventy characters is hard to read. A conversation or a document is a centred column with a maximum width in `rem`, however wide the window.
- **Controls competing with content.** Selects, buttons and gauges in the reading area's header push the thing being read down the page. Settings that change rarely belong in a menu or a compact trailing cluster.
- **Raw data as the display.** JSON in a `pre`, an enum's value as its label, an id as a title. Each has a readable form: a key-value list, a title map, the name it stands for.

## Checking it

Hand the finished surface to the user with the states to look at and the reference product's screen to compare it with (`run-app`). Each difference they name is either a finding or a deviation with its reason.
