# Linked Buttons and Tabs Are Highlighted by the Router

Read when binding `to` on a `v-btn` or `v-tab`, or when the wrong tab is lit.

Once a `v-btn`/`v-tab` carries `to`, Vuetify derives its highlight from the router link and ignores the group's `model-value`: the colour comes from `link.isActive` alone, and `useSelectLink` pushes that same link state into the group, so an over-matching link steals the `v-tab--selected` slider from whichever tab the `model-value` names.

## Two consequences

- **A link is only active on its own exact path when the page is a catch-all** (`pages/foo/[...slug].vue`) — vue-router requires the params to be included, and `["a"]` never includes `["a", "b"]`. Worse, the bare parent path (`/foo`) resolves with **no** param at all, so it "includes" everything and stays lit on every child page. Add `exact` to any tab or button linking to that parent.
- **A tab standing for a group of pages must link to the page you are on** (`:to="category === activeCategory ? route.path : firstPage.path"`) — no single fixed path can match the whole group, so the active tab otherwise renders unlit while a sibling holds the slider.

## The escape hatch

`v-list-item` is immune because every call site passes an explicit `:active` (`props.active !== false` wins over the link), which is also what to use when a linked control's highlight must be computed rather than matched.
