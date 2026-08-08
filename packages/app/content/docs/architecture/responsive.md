---
title: Responsive breakpoints
description: One breakpoint scale feeding both Vuetify and UnoCSS, and when to branch in script versus in the template.
---

# Responsive Breakpoints

The app styles with two systems — Vuetify components and UnoCSS utilities — and they agree on where a viewport becomes narrow because they are given the same numbers. `configuration/breakpoints.ts` declares one private scale (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) typed as Vuetify's `DisplayThresholds`, and exports it twice: `forVuetify` is the raw numeric map, and `forUnoCSS` is the same map with each value rendered as a px string. Nothing else in the repo defines a breakpoint, and nothing should — a second scale is how a component ends up folding its layout at one width while the utility inside it folds at another.

## How it works

```mermaid
flowchart TD
  scale["configuration/breakpoints.ts — one DisplayThresholds scale"]
  scale -->|"forVuetify"| vuetify["vuetify.config.ts — display.thresholds"]
  scale -->|"forUnoCSS"| uno["uno.config.ts — theme.breakpoint"]
  vuetify -->|"auto-imported useVDisplay"| script["script setup — smAndDown, mobile, width"]
  uno -->|"variant prefixes"| template["template — md:grid-cols-2, lg:flex-row"]
  script --> layout["a structurally different layout"]
  template --> values["the same layout with different values"]
```

`vuetify.config.ts` passes `forVuetify` as `display.thresholds` alongside `mobileBreakpoint: "md"`, which makes `mobile` true below the `md` threshold — the same width `smAndDown` covers, so the two flags agree by configuration rather than by coincidence. `uno.config.ts` passes `forUnoCSS` as `theme.breakpoint`, which is what makes `sm:`/`md:`/`lg:`/`xl:` prefixes resolve to those same widths. That file also imports the Vuetify config directly for colours, so the two systems share a palette as well as a scale.

## Choosing where to branch

Both surfaces read the same widths, so the choice is about what changes, not about which library is nearer to hand.

**Reach for `useVDisplay` in script** when a narrow viewport produces a _different_ layout: a control rail that becomes a dropdown, a command bar that collapses into an overflow menu, a panel that is removed rather than shrunk, or a default that must be seeded differently on first render. These decisions have to be expressed as reactive state because something other than CSS depends on them. The composable is auto-imported under its `useV` prefix by `vuetify-nuxt-module` — never import `useDisplay` from `vuetify` directly. `smAndDown` is the flag nearly every call site uses, because the codebase treats the question as "narrow or not" rather than as a ladder of sizes; `app/store/layout.ts` is the exception that reads `mobile`, which resolves to the same width and is what Vuetify's own components (`v-navigation-drawer` and friends) branch on.

**Reach for a UnoCSS prefix in the template** when the layout is unchanged and only a value moves — a grid's column count, a flex direction, a utility that applies above a width. It costs no reactivity and no script line, and it is the right tool precisely when there is nothing for script to decide.

Applied examples live with the features that own them: the [resource explorer](/docs/platform/resource-explorer) folds its two-box layout into a single column on `smAndDown`, and the [call view](/docs/esbabbler/calls/call-view) flips its prejoin screen from a column to a row with a `lg:` prefix.

## Viewport is not device

A breakpoint answers how wide the window is, which is not the same question as what the user is holding. [Dungeons](/docs/dungeons/scenes-and-input) selects between keyboard and joystick controls by device detection, not by breakpoint, because a narrow window on a desktop still has a keyboard and a wide tablet still has none. Use this scale for layout, and device detection for input.

## Key files

Paths relative to `packages/app`.

| File                           | Role                                                                  |
| ------------------------------ | --------------------------------------------------------------------- |
| `configuration/breakpoints.ts` | the single scale, exported for both style systems                     |
| `vuetify.config.ts`            | `display.thresholds` plus `mobileBreakpoint`                          |
| `uno.config.ts`                | `theme.breakpoint`, the source of the variant prefixes                |
| `configuration/vuetify.ts`     | `prefixComposables`, which is what names the composable `useVDisplay` |
| `app/store/layout.ts`          | the one consumer of Vuetify's `mobile` flag                           |
