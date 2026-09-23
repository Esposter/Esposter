---
title: Design language
description: Proposal — the look the UI library draws. The tokens, the three surfaces (frame, raised, sunk), type, motion and state, and the full list of details a finished UI owes, from scrollbars and selection to forced colours and print.
model: claude-opus-5-5
---

# Design Language

The look is the agent console's, generalised: a dusk palette, one pixel face, surfaces with a stepped voxel edge instead of a rounded corner and a blurred shadow, and colour rather than size doing most of the work of emphasis. This page states it as rules a component follows, so that the hundredth component looks like the first without anyone copying one.

## The grid

Everything sits on one step: a quarter rem, the width of the console's panel edge, called a voxel here. Padding, gaps, edge widths, the focus ring's offset and every component's height are whole numbers of steps. A component never states a length the grid cannot express, and the step is a token, so it is written once.

## Three surfaces

Every surface in the app is one of three, and each is drawn with hard-edged box shadows, never a border radius and never a blurred shadow.

| Surface | What it is                    | How it is drawn                                                                                                                  | Used by                                     |
| :------ | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| Frame   | a region that holds content   | a panel fill with a one-step ring outside each side, which leaves the corners notched, and a faint lit line along its top inside | panels, dialogs, menus, cards, the toast    |
| Raised  | something that can be pressed | the edge colour lit along its top and left and shaded along its bottom and right                                                 | buttons, toggles, the thumb of a slider     |
| Sunk    | something that takes input    | the background colour with a one-step shade along its bottom inside                                                              | text fields, selects, the track of a slider |

A pressed raised surface swaps its lit and shaded sides and moves down one step, which is the whole of the press animation. A list row, a tab and a table cell are flat: no surface, only a tint when hovered, selected or focused.

## Type

- **One pixel face**, the console's, for everything the app draws, loaded through `@nuxt/fonts` so it is self-hosted and preloaded rather than fetched from a font service on first paint.
- **A short scale.** The console needs one size because it is one column. An app with pages needs a hierarchy, so there are four sizes, each a whole number of steps: body, a section heading, a page title, and a display size for a landing page. Headings take the accent colour as well, so hierarchy survives a reader who has scaled the text.
- **A readable-text setting.** A pixel face is the look, and it is also harder going for a long read and for some readers. A setting swaps the body token for the system's own sans-serif face, leaving headings and code in the pixel face. It is kept per device in a cookie, as the theme is, so a signed-out reader has it and the first response already renders it, and it is off by default. The setting is one token swap, so no component knows about it.
- **Code** stays in the pixel face in the info colour, as in the console, and syntax highlighting in the docs takes a highlighting theme built from the tokens rather than a stock one.

## Colour

The palette is the interface half of the console's ([foundation](/docs/architecture/ui-library)): background, panel, panel edge, text, muted, accent, and the four status colours, in a dusk theme and a dawn theme. Three rules decide where a colour goes:

- **Emphasis is colour first.** What matters is in the accent colour or the text colour, and what recedes is muted. Opacity is kept for disabled, never used as a second grey.
- **Status is always paired with a mark.** An error is the error colour and a mark or a word, never the colour alone, so it reads for a reader who cannot tell red from green.
- **Every pair is checked.** Each foreground token on each surface token meets the WCAG AA contrast ratio in both themes. A test over the palette map computes every pair, so a palette edit that fails one fails the suite.

## State

| State         | What changes                                                                              |
| :------------ | :---------------------------------------------------------------------------------------- |
| Hover         | brightness up one notch on a raised surface; an accent tint on a flat one                 |
| Pressed       | the raised surface's sides swap and it drops one step                                     |
| Focus-visible | a solid ring one edge wide in the accent colour, one step out, on every focusable element |
| Selected      | an accent tint, and a mark where the control has one                                      |
| Disabled      | the disabled opacity and the default cursor; never hidden, so the reader sees it exists   |
| Loading       | the control keeps its size, its label gives way to the voxel spinner                      |
| Invalid       | the sunk field's bottom shade in the error colour, and the message under it               |

Vuetify 0 marks state on the element as data attributes — selected, disabled, open, the checked state — so each row above is a selector on an attribute rather than a prop threaded through the component.

## Motion

- **Stepped.** Transitions use a stepped timing function, a few frames rather than a smooth curve, which is what makes a pixel UI read as one. Durations are tokens and short.
- **Only what explains something moves**: a menu opening from its trigger, a toast arriving, a dialog lifting. Nothing loops except a spinner and the working line.
- **Reduced motion** removes every transition and every loop but the spinner, which turns into a static mark. Vuetify 0's reduced-motion composable is the one reader of the preference.

## Everything else a finished UI owes

These are the details that make the difference between a themed app and a designed one. Each belongs to a component or to the document, and each is listed so none is left to a default.

- **Scrollbars.** Thin, in the palette, set once on the root ([foundation](/docs/architecture/ui-library)). A scroll area inside a frame gets the frame's fill as its track.
- **Selection and caret** in the accent colour.
- **Context menus** everywhere a thing on screen has actions of its own ([context menus](/docs/architecture/ui-library#context-menus)). The browser's own menu stays wherever the app offers nothing better, such as over plain text and links.
- **Tooltips** as a small frame that pops out the moment the pointer or the keyboard arrives, dismissed by Escape, and never the only place a label lives.
- **Toasts** in one stack in one corner, each a frame with its status mark, pausing while hovered, and announced through a live region.
- **Dialogs** as a frame with a title bar, over a dithered scrim — a checker of the background colour rather than a blurred wash — with focus trapped, restored on close, and the page behind made inert.
- **Menus and selects** in the top layer through the Popover API, flipped when there is no room, with typeahead, Home and End, and the active option announced.
- **Loading** as the console's voxel bar for a page and the spinner for a control; a skeleton is a block in the panel colour stepping between two shades, never a shimmer.
- **Empty and error states** as a frame with a mark, one sentence and at most one action.
- **Images.** Pixel art — the achievement badges, the game sprites, the voxel marks — renders with pixelated scaling. A photo or an avatar never does. An avatar is square with a notched frame.
- **Touch.** On a coarse pointer every target is at least eleven steps square, and a long press opens the context menu.
- **Forced colours.** A box-shadow edge is removed when Windows forces colours, so every surface also carries a transparent border that the forced palette paints in, and the focus ring is an outline, which forced colours keep.
- **Print.** Chrome, scrims and edges drop out, text prints dark on white, and a link prints its address.
- **The browser around the page.** The theme colour meta tag, the PWA manifest's colours and the social preview image read the tokens, so the address bar and an install match the page.
- **Charts** take their series colours from the tokens, and their axes and grid lines from the muted and edge colours.
- **Sound.** None. A reaction a theme adds, such as the agent console's voice, belongs to that theme.

## Key files

| File                                             | Role after the change                                       |
| :----------------------------------------------- | :---------------------------------------------------------- |
| `apps/web/uno.config.ts`                         | The frame, raised and sunk surfaces, shipped as rules       |
| `apps/web/app/components/AgentConsole/Index.vue` | The one-face rule, lifted to the app                        |
| `apps/web/app/components/Ui/LoadingBar.vue`      | The voxel loading bar, reused as the app's page loading bar |
| `apps/web/configuration/content.ts`              | Its highlighting theme is built from the tokens             |
| `apps/web/configuration/pwa.ts`                  | Its manifest colours read the tokens                        |

## Sources

- [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), W3C: the ratio every token pair is tested against.
- [forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors), MDN: why a shadow-drawn edge needs a transparent border to survive high-contrast mode.
- [steps()](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/steps), MDN: the stepped timing function every transition uses.
- [Styling](https://0.vuetifyjs.com/guide/fundamentals/styling), Vuetify 0: the state data attributes each state row is a selector on.
