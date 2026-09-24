# Where Good Layout Is Looked Up, Not Improvised

Read when laying out a new surface or a new product page, or when judging whether one looks right. The placement rules are in `SKILL.md`, component choice in `vuetify`, and the utilities in `styling`. This page is where the look itself comes from. A layout composed from memory, one component at a time, reads as a stack of parts, even when every part follows its rule.

## Look it up first, every time

The full list of sources, with what each gave the app and the order they are consulted in, is `apps/web/content/docs/architecture/design-sources.md`. The three below are the ones every layout starts from.

- **The reference product's own screen.** Before writing a template, find how the product the feature is modelled on arranges the same data, and match its hierarchy: what is large, what recedes, what sits in the margin. The messaging surfaces follow Discord and Slack (`SKILL.md`). The agent console is the exception: a game with its own palette and pixel font and no Vuetify, so it is not held to the app's components. Its panel column still keeps the Claude desktop app's Code tab and T3 Code hierarchy — one conversation column, the composer pinned under it — and the rest is its own voxel world page (`apps/web/content/docs/infra/claude-interface/agent-console/voxel-world.md`).
- **Vuetify's own pages.** The component page at `https://vuetifyjs.com/en/components/<name>/` shows the intended variants and densities. The wireframes at `https://vuetifyjs.com/en/getting-started/wireframes/` are the app-level layouts Vuetify is built to render. The `vuetify-mcp` tools answer the API question in-session (`get_component_api_by_version`, `get_feature_guide`), so a prop is looked up rather than guessed.
- **Material 3.** `https://m3.material.io/` is the system Vuetify 4 implements: the type scale the `text-*` roles map to, the spacing grid, when a surface earns elevation or a tonal fill, and how dense a list may get.

## What a first draft gets wrong

Each of these is a finding in review, whatever the rules above say about the parts.

- **Everything boxed.** Borders, cards, chips and expansion panels on every item flatten the hierarchy until nothing leads. Group with space and type roles first, and give a surface to the one region that needs it.
- **Chips as labels.** A chip is a control or a count. A state or a figure beside a title is text in a lower-emphasis role.
- **Full-width reading text.** Prose wider than about seventy characters is hard to read. A conversation or a document is a centred column with a maximum width in `rem`, however wide the window.
- **Controls competing with content.** Selects, buttons and gauges in the reading area's header push the thing being read down the page. Settings that change rarely belong in a menu or a compact trailing cluster.
- **Raw data as the display.** JSON in a `pre`, an enum's value as its label, an id as a title. Each has a readable form: a key-value list, a title map, the name it stands for.

## Checking it

Hand the finished surface to the user with the states to look at and the reference product's screen to compare it with (`run-app`). Each difference they name is either a finding or a deviation with its reason.
