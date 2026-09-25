---
name: ui-library
description: Apply when building or restyling any interface in apps/web, choosing a colour, adding a UI component, or reaching for @vuetify/v0. Esposter's own UI library — three layers (feature, library, Vuetify 0), the import boundary that keeps Vuetify 0 inside the library, the design tokens as the one source of colour, the document chrome and theme scopes, the surfaces as UnoCSS rules, the four type rules, anything pressed wearing ui-button, a field in a UiForm with the library's rules, a component's keyboard test, icon classes written whole, library icons named by meaning through UiIconMap, the design pass every unit takes (motion, placement, a signature detail), and the ledger a unit is swept on. Outranks the vendored vuetify0 skill wherever they meet.
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

- **A feature never names a style.** It reaches the look through a surface rule, a token or an icon meaning, never a shadow in steps, a face or an icon set by hand, so both styles draw it. `useUiStyle` and the `data-ui-style` attribute are the library's alone: oxlint refuses the composable elsewhere, and `app/templates.test.ts` refuses the attribute and its selector outside the library, `NuxtTheme` and the document chrome, an edge in steps outside the library, and voxel's face or icon set anywhere but the icon map.
- **A drawing no token can express belongs to the library.** The component carries the nearest style on its own element through `useUiStyle` and keys its scoped style or its shortcut on it, as the spinner, the skeleton and `ui-blocks` do, with the same DOM and roles in every style. A token is always preferred where one can say it, since a token already resolves at the nearest scope.
- **A new library component's test runs once per style** through `setupUiStyle`, and the eye check of a handed-over unit covers both styles in both modes.

## Three layers

- **A feature uses the library; only the library imports Vuetify 0.** The library's folders are listed in the `.oxlintrc.json` override that lifts the `@vuetify/v0` ban. When a feature needs a behaviour the library does not have yet, grow the library first, as a separate commit — never import Vuetify 0 from the feature behind a disable.
- **The vendored `vuetify0` skill applies inside the library only.** Its "never a native button, use Button" rule is right for the library's own components and wrong for a feature, which uses the library's component instead. Where the two skills disagree, this one wins.
- **Build a component for the feature that consumes it, not in advance.** What exists is the architecture page's Components section.

## Tokens

How the palette reaches UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`. The rules an edit follows:

- **A colour is a token.** A new colour is an entry in `UiPaletteMap` for both themes; a component or a template never writes a hex value or a palette colour the token set already covers.
- **A length is a whole number of `--ui-step`, and a duration of `--ui-motion-unit`**: a transition names `--ui-motion-short`, `--ui-motion-medium` or `--ui-motion-long`, each a duration on the one eased curve, and never a time, an easing or a `steps()` of its own, so reduced motion holds it still with the rest. Motion is never stepped: stepped frames read as frame drops and make every pop-in feel slow (the architecture page's Motion section).
- **Type is the four rules.** A page's root wears `ui-body`, and a heading wears `ui-heading`, `ui-title` or `ui-display`; a template never sets a font family, a size or a weight of its own. Each face is its own token — `--ui-font-body`, which the readable-text setting swaps, `--ui-font-heading`, and `--ui-font-mono` for code — and a title that is none of the four takes `text-heading-color`.
- **Adding a palette pair or a style token, or selecting a theme,** follows `references/tokens.md`: a pair that fails the palette test is re-picked, only `NuxtTheme` selects, and a drawing value is a style token.

## Icons

A library component and a menu's action name an icon by meaning — `UiIconMeaning` through `UiIconMap`, a glyph in every style — and a set's own class never appears in a feature. Adding a meaning, writing a class whole where one is unavoidable, the `// @unocss-include` a `.ts` file needs and finding an icon in a test are `references/icons.md`.

## Components

What exists, what each is built on and its keyboard contract are the architecture page's Components section. The rules an edit follows:

- **A card is not a row.** What a reader chooses whole from among its siblings — a post, a type to create, an achievement — is a `ui-card`, a frame that takes the style's hover; `ui-item` and `ui-row` are for a list or a menu. Minimal never means turning cards into rows: a menu's look on a page's content blends what is picked into what is chosen from.
- **Every row of a list is drawn by `UiItemContent` inside a `ui-item`** — or a `ui-row` where the row goes nowhere: mark, title, shortcut on one line — and leads with a mark; `Item` and `UiCommand` refuse a row with none at the typecheck. A `UiList` row whose mark the list's mark slot draws says so with `hasMarkSlot`, never a placeholder `icon: ""`.
- **A new component comes with a component test of its keyboard and ARIA contract**, mounted with the real Vuetify 0 parts rather than mocked ones. A feature's test never re-tests them.
- **A surface is a rule, not a style block.** `ui-frame`, `ui-lifted`, `ui-raised`, `ui-field`, `ui-pill`, `ui-popover` and `ui-item` live in `uno.config.ts`, since a primitive's part can only be dressed by class. A component that draws a surface wears the rule instead of restating its shadows.
- **Anything pressed wears `ui-button`**: `UiButton`, or `UiButtonLink` for somewhere to go, which stays a real link. The one exception is an action inside a sentence, a system line's "Edit Room", which is `UiInlineAction` so it never breaks the line around it. A `NuxtLink` dressed by hand as a button restates the variants. A button and a `ui-item` row lay out their own content — the flex row, gap, alignment, block padding and height — so a call site adds none of it (`app/templates.test.ts`, "library layout").
- **A utility cannot recolour a surface**: a `bg-*` or `text-*` written on `ui-frame`, `ui-raised` or `ui-field` loses to it (why is the architecture page's "What building them taught"). A state that recolours one is a data attribute the component's scoped style reads.
- **A search is `UiTextField` with the search type**: a pill with a search mark, its label as the hint inside it and still its accessible name, and its own clear button once it holds text, so a feature never draws one beside it. A surface rule draws and never lays out: `ui-field` carries no padding, which the call site gives. A field is the panel tone and draws no line, no ring and no shade: `ui-field` tints it while focused, and the text field while invalid, so a feature adds neither. `globals.scss`'s reset layer already strips the native inset border of `input`, `textarea` and `select`, so a feature never adds `b-none` to an input.
- **A field is `UiTextField` inside a `UiForm`**, passed rules from `UiRules` — the library's builders, one wording across every field — or a `UiRule` of its own. A list built from constants is a plain array, never a computed. The form's `isValid` is false only once a field has failed, so a submit button can stand disabled on it.
- **A choice between views of one thing is `UiTabs`**, keyed to a model — a route query where the view should survive a reload. Tabs that go somewhere — a docs category — are `UiTabLinks`, real links whose current one the call site names; a group in a navigation that opens and closes is `UiCollapsible`.
- **The call site's attributes go on top of the primitive's.** When a primitive overrides what a call site passes — as the button does with `type` and `aria-pressed` — render the element from its attribute slot with `$attrs` spread after, and expose the element if something must focus or anchor to it.
- **A field's completions are `UiSuggestions` beside the field, never a menu.** Focus stays in the field; a menu moves focus into itself and is for actions.
- **A menu item is data** — a `UiMenuItem` list — so a context menu and an overflow button can share one list later. A command already under way is a disabled item, never a hidden one, and a family of commands — one per export format — is a flat group named by verb and member, never a submenu.
- **A form from a Zod schema is `UiSchemaForm`**; its schemas' rules are `references/schema-forms.md`.
- **A key a surface handles — a shortcut, a grid's arrows, a right-click, a search of its own — goes through the library's one mechanism for it**, never a listener of the feature's own; which mechanism is `references/keys-and-commands.md`.
- **A write's confirmation, a modal and a toast are the library's**, each answering the write it is handed; how a dialog closes on a write, what a modal's content can open, and the one toast stack are `references/dialogs-and-toasts.md`.
- **A name shown on hover is a `UiTooltip`**, its activator props bound onto the element, never a `title` attribute, which the browser draws in its own look. Anything else bound there joins them in one `mergeProps(activatorProps, …)`, never a second `:=`, which silently drops the first's handlers (`vue/no-duplicate-attributes` refuses it). An icon button is `UiIconButton`, whose `label` is its name and its tooltip at once.
- **A tooltip is for a control with no visible text.** Every icon-only control has one, the visible twin of its accessible name; a control whose own text, or a label beside it, already says it — a text button, a filter pill, a date field — has none, so `UiPopover` and `UiMenu` take `isLabelShown`. A labelled control's inline `UiTooltip` says what its text does not: the exact time behind a relative one, the room header's Edit Room.
- **A date is `UiDateField`, a span of days `UiDateRangeField`, and events in time `UiEventCalendar`** — what they are built on and what a call site hands them: `references/dates.md`.
- **A list a read fills is loading until a read settles, never empty.** Skeletons in the content's own shape while a read is out and nothing is on screen — the first read, and a sort, filter or scope change that empties the list before it reads again — `UiErrorState` when it failed, and `UiEmptyState` only once a read has settled with nothing. The gate is the read's own state (`readItems`' and an auto search's `isPending` and `isError`, `useAsyncData`'s `status`); an empty state behind `items.length === 0` alone flashes on every read. No lint can tell a read-backed list from a local one, so the design pass asks it of every list.
- **A fixed region starts past the dock**: subtract `--dock-inset-inline-start` and `--dock-inset-block-end`, never a bar's height.
- **A page that is one of a kind of thing declares its mark** with `usePageMark` while mounted — the resource page its type — so the dock draws that kind's icon rather than its title's letter. A mark is data resolved to an icon when drawn, never a stored icon class (the architecture page's App shell).

## The document chrome

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.scss`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed. A region in another theme is a `UiThemeScope`, never a palette set on its root; the chrome follows it.

## The design pass

A unit is designed, not repainted. Before a unit or a library component is built, and again before it is handed over, walk `references/design-pass.md`: motion on whatever appears or disappears, placement from what the surface is for, the full width used, one thing to do first, every state designed, a signature detail drawn through the library rather than by hand, and a reason it beats the reference product rather than only matching it.

## Redesigning a unit

A unit's flows and states are inventoried before its template is touched, and it fails if the new version drops one; the procedure, the licence to redesign across pages and the ledger trailer are `references/redesigning-a-unit.md`.
