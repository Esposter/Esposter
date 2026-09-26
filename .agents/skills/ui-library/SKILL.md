---
name: ui-library
description: Apply when building or restyling any interface in apps/web, choosing a colour, adding a UI component, or reaching for @vuetify/v0. Esposter's own UI library over Vuetify 0 — its layers and import boundary, tokens, surfaces, components and their contracts, and the design pass every unit takes. Outranks the vendored vuetify0 skill wherever they meet.
---

# UI Library

Every interface in the app is drawn by a library of its own, built in `apps/web` on Vuetify 0's headless primitives. How it is built is `apps/web/content/docs/architecture/ui-library.md`, how it looks is `apps/web/content/docs/architecture/design-language.md`; this skill is the rules an edit follows.

## Settled — do not re-propose

- **A styled component library, another headless library, or writing the behaviour ourselves.** Argued and rejected in `apps/web/content/docs/architecture/ui-library.md`.
- **Moving the library into a package.** It stays in `apps/web` until a second app consumes it.
- **Auto-importing Vuetify 0.** Its names collide with VueUse's; the library imports it by name, and nothing else imports it at all.
- **Keeping the palette in the library's services folder.** `uno.config.ts` reads it, and loads before any `@/` alias resolves, so it lives in `apps/web/configuration/` beside `breakpoints.ts` and imports its enums relatively.
- **Dropping preset-wind4's preflight reset.** Every surface assumes its zeroed margins, markers and inherited links; a browser default the library needs is restated where it is needed, as a dialog's margins and a read list's markers are (`apps/web/content/docs/architecture/ui-library.md`, "Rejected").
- **Voxel as the app's only look.** Standard is the default and voxel is pinned by the agent console and the games; why one look was rejected is the architecture page's "Design styles" section.

## A look is a style, not the library

The look is a design style — standard, the default, or voxel — beside light and dark; the tiers, the selection and what each style draws are the architecture page's "Design styles" section. The rules an edit follows:

- **A feature never names a style** — it reaches the look through a surface rule, a token or an icon meaning; `useUiStyle` and `data-ui-style` are the library's alone (`references/design-styles.md`).
- **A drawing no token can express belongs to the library**, keyed on `useUiStyle` with the same DOM and roles in every style (`references/design-styles.md`).
- **A new library component's test runs once per style** through `setupUiStyle`, and the eye check of a handed-over unit covers both styles in both modes.

## Three layers

- **A feature uses the library; only the library imports Vuetify 0** — a missing behaviour grows the library first, in a commit of its own (`references/layers.md`).
- **The vendored `vuetify0` skill applies inside the library only**, and this skill wins where the two disagree (`references/layers.md`).
- **Build a component for the feature that consumes it, not in advance.** What exists is the architecture page's Components section.

## Tokens

How the palette reaches UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`. The rules an edit follows:

- **A colour is a token.** A new colour is an entry in `UiPaletteMap` for both themes; a component or a template never writes a hex value or a palette colour the token set already covers.
- **A length is a whole number of `--ui-step`, and a duration is `--ui-motion-short`, `-medium` or `-long`** — never a time, an easing or a `steps()` of its own (`references/tokens.md`).
- **Type is the four rules** — `ui-body` on a page's root, `ui-heading`, `ui-title` or `ui-display` on a heading, and never a font family, size or weight of the template's own (`references/tokens.md`).
- **Adding a palette pair or a style token, or selecting a theme,** follows `references/tokens.md`: a pair that fails the palette test is re-picked, only `NuxtTheme` selects, and a drawing value is a style token.

## Icons

A library component and a menu's action name an icon by meaning — `UiIconMeaning` through `UiIconMap`, a glyph in every style — and a set's own class never appears in a feature. Adding a meaning, writing a class whole where one is unavoidable, the `// @unocss-include` a `.ts` file needs and finding an icon in a test are `references/icons.md`.

## Components

What exists, what each is built on and its keyboard contract are the architecture page's Components section. The rules an edit follows:

- **A card is not a row**: what a reader chooses whole is a `ui-card`, and `ui-item`/`ui-row` are for a list or a menu (`references/surfaces.md`).
- **Every list row is `UiItemContent` inside a `ui-item`**, or a `ui-row` where it goes nowhere, and leads with a mark (`references/surfaces.md`).
- **A new component comes with a component test of its keyboard and ARIA contract**, mounted with the real Vuetify 0 parts rather than mocked ones. A feature's test never re-tests them.
- **A surface is a rule, not a style block** — a component wears `ui-frame`, `ui-raised`, `ui-field` and the rest from `uno.config.ts` (`references/surfaces.md`).
- **Anything pressed wears `ui-button`** — `UiButton`, `UiButtonLink` for somewhere to go, `UiInlineAction` inside a sentence — and lays out its own content (`references/buttons.md`).
- **A utility cannot recolour a surface**; a state that recolours one is a data attribute the component's scoped style reads (`references/surfaces.md`).
- **A search is `UiTextField` with the search type**, and a field draws no line, ring, shade or padding of the feature's own (`references/fields.md`).
- **A field is `UiTextField` inside a `UiForm`**, with its rules from `UiRules` or a `UiRule` (`references/fields.md`).
- **A choice between views of one thing is `UiTabs`**; tabs that go somewhere are `UiTabLinks` (`references/tabs.md`).
- **The call site's attributes go on top of the primitive's** — render from the attribute slot with `$attrs` spread after (`references/authoring-components.md`).
- **A popover's open state is the ref handed to `usePopover`, never a mirror of the one it returns** — no watcher between the two, and a derived one is a `computed` with a `noop` setter: `references/popovers.md`.
- **A field's completions are `UiSuggestions` beside the field, never a menu.** Focus stays in the field; a menu moves focus into itself and is for actions.
- **A menu item is data** — a `UiMenuItem` list, a command under way disabled rather than hidden (`references/menus.md`).
- **A form from a Zod schema is `UiSchemaForm`**; its schemas' rules are `references/schema-forms.md`.
- **A key a surface handles — a shortcut, a grid's arrows, a right-click, a search of its own — goes through the library's one mechanism for it**, never a listener of the feature's own; which mechanism is `references/keys-and-commands.md`.
- **A write's confirmation, a modal and a toast are the library's**, each answering the write it is handed; how a dialog closes on a write, what a modal's content can open, and the one toast stack are `references/dialogs-and-toasts.md`.
- **A name shown on hover is a `UiTooltip`**, never a `title` attribute, and only on a control with no visible text; it joins other bindings in one `mergeProps(activatorProps, …)` (`references/tooltips.md`).
- **A date is `UiDateField`, a span of days `UiDateRangeField`, and events in time `UiEventCalendar`** — what they are built on and what a call site hands them: `references/dates.md`.
- **A button whose write waits on the server says so through `is-pending`**, never a hand-drawn spinner or a flag folded into `:disabled` (`references/buttons.md`).
- **A list a read fills is loading until a read settles, never empty** — gated on the read's own state, never on `items.length === 0` (`references/loading-states.md`).
- **A fixed region starts past the dock**: subtract `--dock-inset-inline-start` and `--dock-inset-block-end`, never a bar's height.
- **A page that scrolls inside its own regions passes `is-viewport-height` to its layout**; every other page scrolls the window (`references/app-shell.md`).
- **A page that is one of a kind of thing declares its mark** with `usePageMark` while mounted (`references/app-shell.md`).

## The document chrome

Scrollbars, selection, the caret, native accents and the focus ring live once in the `ui-chrome` layer, and a region in another theme is a `UiThemeScope` (`references/document-chrome.md`).

## The design pass

A unit is designed, not repainted. Before a unit or a library component is built, and again before it is handed over, walk `references/design-pass.md`: motion on whatever appears or disappears, placement from what the surface is for, the full width used, one thing to do first, every state designed, a signature detail drawn through the library rather than by hand, and a reason it beats the reference product rather than only matching it.

## Redesigning a unit

A unit's flows and states are inventoried before its template is touched, and it fails if the new version drops one; the procedure, the licence to redesign across pages and the ledger trailer are `references/redesigning-a-unit.md`.

## Reference pages

- `references/design-styles.md` — when a look differs by style, or a library component draws what no token can say.
- `references/layers.md` — when a feature needs a behaviour the library lacks, or the vendored `vuetify0` skill meets a feature.
- `references/surfaces.md` — when choosing a card or a row, drawing a list row, or dressing or recolouring a surface.
- `references/buttons.md` — when adding anything pressed, or a button whose write waits on the server.
- `references/fields.md` — when adding a search, a text field or a form.
- `references/tabs.md` — when a surface offers views of one thing, tabs that navigate, or a collapsible group.
- `references/authoring-components.md` — when a library component overrides a call site's attributes or exposes its element.
- `references/menus.md` — when building a menu's, an overflow button's or a context menu's items.
- `references/tooltips.md` — when a control needs a name on hover, or it is unclear whether it takes one.
- `references/loading-states.md` — when a list or a panel is filled by a read.
- `references/app-shell.md` — when a page scrolls inside itself, opens an edge drawer, or declares its mark for the dock.
- `references/document-chrome.md` — when styling scrollbars, selection, the caret, native accents or focus, or theming a region.
