---
title: Design styles
description: Proposal — make the look a design style the reader can switch, a second axis beside light and dark. The layout every style shares stays fixed; a style supplies only the palette, shape, type, icons and the drawing of each surface. Voxel stays as one style, and a standard one — neutral surfaces, rounded corners, a sans face — joins it and becomes the default.
model: claude-opus-5-5
---

# Design Styles

The voxel look now covers the whole app: the dusk palette, the pixel face, notched frames, raised buttons and pixel icons on every page the library draws. On a page that is a game, or the agent console, it is the right look. On the pages a reader spends a long session in — a room's messages, a sheet, the docs — it reads as a game on every screen, and it tires quickly. What those pages want is the look most shipped products have settled on: neutral surfaces, one accent, hairline borders, rounded corners and a sans face.

Replacing the voxel look outright would throw away the part of the work that was about the look. Nothing else needs to go: every colour in the library is already a token, every surface is one of a handful of rules, and every icon is named by meaning. So this proposal makes the look itself a value. A **design style** is a named set of everything that decides how the interface is drawn, selected per reader the way light and dark are. The voxel look becomes the first style. A second, **standard**, joins it and becomes the default. Everything a style is not allowed to touch — spacing, sizes, placement, behaviour — is shared, which is what lets a unit be checked once and trusted in every style.

## Two tiers

The two tiers have shipped, with voxel as the only style: what exists is the [design styles](/docs/architecture/ui-library#design-styles) section of the UI library page. What this proposal still adds on them:

- **A style is a bundle, not a set of knobs.** Radix Themes exposes radius, scaling and panel background as independent props on its theme; here they travel together, because the voxel look's parts only make sense together — a pixel face on rounded corners is neither style.
- **The standard style's lengths are its own.** A hairline border is not a whole number of steps, and it is still a shadow inset into the box rather than a border, so it takes no room the layout tier sized.

## What each style draws

Standard has shipped beside voxel: what each draws is the [design styles](/docs/architecture/ui-library#design-styles) section of the UI library page.

## How a style is selected

Selection has shipped with voxel as the only style: the cookie, the store, the root attribute, a scope's pinned style, the palette keyed by style, the icon map's rows and Vuetify's colours are the [design styles](/docs/architecture/ui-library#design-styles) section of the UI library page. What standard adds is only a column in each of those maps.

## What makes it safe to switch

A style is only worth having if switching it can never move or break anything. Each guarantee is held by something that fails, not by care:

- **A style cannot write the layout tier.** The style map's type holds only style tokens, so a style that sets a padding does not type-check.
- **Every style is complete.** The style map and the icon map are `satisfies Record<UiStyle, …>`, so a new token or a new meaning without a value in every style fails the typecheck, and the palette test runs over every style and mode.
- **One DOM in every style.** A library component whose drawing differs by style — the spinner, the progress blocks — keys its scoped style on the style attribute and renders the same elements with the same roles in each. Its component test runs once per style, so a contract that holds in one and breaks in the other fails.
- **Features never branch on a style.** A lint rule bans the `data-ui-style` selector and the style composable outside the library's folders, the same override that holds the Vuetify 0 boundary. What a feature needs to differ, the library draws.
- **Checked by eye in each style.** A unit handed over for the eye check is looked at in both styles and both modes, switched from the command palette.

## The stages

The two tiers, selection and the standard style have shipped. What remains runs in this order, one coherent commit each:

```mermaid
flowchart TD
  N[Enforcers: every library test once per style, the style selector banned outside the library]
  N --> L[The style-leak sweep: features that draw voxel by hand]
  L --> D{Every library component and migrated unit checked by eye in both styles and both modes?}
  D -->|no| L
  D -->|yes| E[Standard becomes the default]
```

- **Enforcers.** Every library component test runs once per style, and a lint rule bans the style attribute's selector and the style composable outside the library's folders.
- **The style-leak sweep** finds whatever a feature draws in the voxel look by hand instead of through the library — a shadow written in steps, the pixel face named directly, a Pixelarticons class — and routes it through a rule, a token or a meaning. It is a ledger like the page migration's, and the page migration's remaining units are migrated leak-free, which the design pass checks.
- **Standard becomes the default.** Once every library component and every migrated unit has been checked by eye in both styles and both modes, a reader with no cookie gets standard.

## Rejected

- **Replacing the voxel look outright.** It is the right look for the agent console and the games, it is most of what the library's first stages built, and a second style costs a column of values rather than a rewrite. Keeping it also keeps the tiers honest: with two styles live, a leak shows the day it is written.
- **Adopting Nuxt UI.** It is the reference for the standard style's values, not its implementation. It is built on Tailwind CSS, where every template here is UnoCSS attributify; on Reka UI, a second headless layer beside Vuetify 0; and its components would replace the library's, each with a keyboard contract already tested. It would also be a third look on screen for as long as the migration runs. What it gets right — the semantic token vocabulary, one radius, the neutral scale — is taken as values.
- **A style as a prop on each component**, as a styled library's variants are. Every call site would then know the style, and a feature could pick one per button. A style is the document's, or a scope's.
- **A style as a palette alone.** Colours cannot take the notches off a frame or the pixel face off a heading. The palette is one row of a style, not the style.

## Decided

Each was chosen from a mockup of both styles side by side in dark and light:

- **The standard accent is green**, the app's original Material primary and Nuxt UI's default, which keeps it clear of the info blue that links are drawn in.
- **The standard face is Inter**, self-hosted, as Linear uses it, with a mono beside it for code.
- **The agent console pins voxel** on its existing scope, as the games do.
- **The style is called standard.**

## Key files

| File                                    | Role after the change                    |
| :-------------------------------------- | :--------------------------------------- |
| `apps/web/app/services/ui/UiIconMap.ts` | Standard's row, Lucide for every meaning |

New files, where the conventions put them:

```text
.agents/ledgers/ui-style.md                ← the style-leak sweep
```
