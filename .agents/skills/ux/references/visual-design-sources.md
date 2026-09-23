# Where Good Layout Is Looked Up, Not Improvised

Read when laying out a new surface or a new product page, or when judging whether one looks right. The placement rules are in `SKILL.md`, component choice in `vuetify`, and the utilities in `styling`. This page is where the look itself comes from. A layout composed from memory, one component at a time, reads as a stack of parts, even when every part follows its rule.

## Look it up first, every time

- **The reference product's own screen.** Before writing a template, find how the product the feature is modelled on arranges the same data, and match its hierarchy: what is large, what recedes, what sits in the margin. The messaging surfaces follow Discord and Slack (`SKILL.md`). The agent console follows the Claude desktop app's Code tab and T3 Code. Each is one conversation column of readable width, with tool calls as compact inline rows inside it, the composer as a rounded card pinned under it, and a thin header. Neither is a grid of panels.
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

The end-of-change visual pass (`run-app`) captures the states. Read each capture beside the reference product's screen, not against memory, and write down every difference as either a finding or a deviation with its reason.
