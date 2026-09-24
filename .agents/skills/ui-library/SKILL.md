---
name: ui-library
description: Apply when building or restyling any interface in apps/web, choosing a colour, adding a UI component, or reaching for @vuetify/v0. Esposter's own UI library — three layers (feature, library, Vuetify 0), the import boundary that keeps Vuetify 0 inside the library, the design tokens as the one source of colour for both libraries during the migration, the document chrome and theme scopes, the surfaces as UnoCSS rules, the four type rules, anything pressed wearing ui-button, a field in a UiForm with Vuetify's rules, a component's keyboard test, icon classes written whole, library icons named by meaning through UiIconMap, the design pass every unit takes (motion, placement, a signature detail), and the page migration's ledger. Outranks the vendored vuetify0 skill wherever they meet.
---

# UI Library

The app is moving off Material-as-Vuetify-draws-it onto a library of its own: the agent console's voxel look, built in `apps/web` on Vuetify 0's headless primitives. The design and the ladder of stages are `apps/web/content/docs/proposals/refactors/ui-library/index.md`; this skill is what holds while the migration runs.

## Settled — do not re-propose

- **Restyling Vuetify, another headless library, a styled library, or writing the behaviour ourselves.** Argued and rejected in the proposal's index ("Why this and not another way").
- **Moving the library into a package.** It stays in `apps/web` until a second app consumes it.
- **Auto-importing Vuetify 0.** Its names collide with VueUse and with the "useV" names Vuetify's module auto-imports; the library imports it by name, and nothing else imports it at all.
- **Keeping the palette in the library's services folder.** `vuetify.config.ts` and `uno.config.ts` read it, and they load before any `@/` alias resolves, so it lives in `apps/web/configuration/` beside `breakpoints.ts` and imports its enums relatively, as `configuration/vuetify.ts` does.
- **Voxel as the app's only look.** A second style costs a column of values rather than a rewrite, and voxel stays for the agent console and the games, which pin it; standard is the default. The rest of what was rejected about styles is the architecture page's "Design styles" section.

## A look is a style, not the library

The look is a design style — standard, the default, or voxel — beside light and dark; the tiers, the selection and what each style draws are the architecture page's "Design styles" section. The rules an edit follows:

- **A feature never names a style.** It reaches the look through a surface rule, a token or an icon meaning, never a shadow in steps, a face or an icon set by hand, so both styles draw it. `useUiStyle` and the `data-ui-style` attribute are the library's alone: oxlint refuses the composable elsewhere, and `app/templates.test.ts` refuses the attribute and its selector outside the library, `NuxtTheme` and the document chrome, an edge in steps outside the library, and voxel's face or icon set anywhere but the icon map.
- **A drawing that differs by more than a value is the library's.** The component carries the nearest style on its own element through `useUiStyle` and keys its scoped style or its shortcut on it, as the spinner, the skeleton and `ui-blocks` do, with the same DOM and roles in every style. A token is always preferred where one can say it, since a token already resolves at the nearest scope.
- **A new library component's test runs once per style** through `setupUiStyle`, and a unit handed over for the eye check is looked at in both styles and both modes.

## Three layers

- **A feature uses the library; only the library imports Vuetify 0.** The library's folders are listed in the `.oxlintrc.json` override that lifts the `@vuetify/v0` ban. When a feature needs a behaviour the library does not have yet, grow the library first, as a separate commit — never import Vuetify 0 from the feature behind a disable.
- **The vendored `vuetify0` skill applies inside the library only.** Its "never a native button, use Button" rule is right for the library's own components and wrong for a feature, which uses the library's component instead. Where the two skills disagree, this one wins.
- **Which component replaces which Vuetify component, and in which stage**, is the proposal's `components.md`. Build a component for the stage that consumes it, not in advance.

## Tokens

How the palette reaches both libraries, UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`. The rules an edit follows:

- **A colour is a token.** A new colour is an entry in `UiPaletteMap` for both themes; a component or a template never writes a hex value or a Vuetify colour the token set already covers.
- **Vuetify never gets a colour of its own** — `vuetify.config.ts` only maps tokens onto its theme keys, so one palette edit repaints both libraries.
- **A new pair that fails the palette test is re-picked**, never exempted from it.
- **Only `NuxtTheme` selects a theme**: one watcher on Vuetify's mode and the reader's style calls `useSelectUiTheme`, which selects the pair in both libraries. A region in another mode or style is a `UiThemeScope`; the style a component draws in is `useUiStyle`'s, never the store's.
- **A length is a whole number of `--ui-step`, and a duration of `--ui-motion-unit`**: a transition names `--ui-motion-short`, `--ui-motion-medium` or `--ui-motion-long`, each a duration on the one eased curve, and never a time, an easing or a `steps()` of its own, so reduced motion holds it still with the rest. Motion is never stepped: stepped frames read as frame drops and made every pop-in feel slow (the architecture page's Motion section).
- **A drawing value is a style token.** A radius — a control's or a container's — an edge width, a surface's fill or shadow, a hover treatment, a face, a type size, the heading colour or the scrim is a `UiStyleToken` with a value in every column of `UiStyleMap` (`apps/web/configuration/`), read as its `--ui-<token>` custom property. A rule or a library component reads the token and never writes one style's value; nothing a style holds is a padding, a gap or a height, which stay in the layout tier in `globals.scss`.
- **Type is the four rules.** A migrated page's root wears `ui-body`, and a heading wears `ui-heading`, `ui-title` or `ui-display`; a template never sets a font family, a size or a weight of its own. Each face is its own token — `--ui-font-body`, which the readable-text setting swaps, `--ui-font-heading`, and `--ui-font-mono` for code — and a title that is none of the four takes `text-heading-color`.

## Icons

How icons reach both libraries is the architecture page's Icons section. The rules an edit follows:

- **An icon class is written whole** — `i-mdi:`, `i-pixelarticons:` or `i-lucide:` and the name — in the file that uses it — a prop or a map entry. The preset generates only what its extractor sees, so a name assembled at runtime draws nothing, and so does one written as a `v-icon`'s text content: pass it as the `icon` prop.
- **A `.ts` file that names an icon starts with `// @unocss-include`.** The pipeline does not scan TypeScript — widening it to every `.ts` file feeds the attributify extractor arbitrary code and breaks the stylesheet. `uno.config.test.ts` fails on a file that forgets.
- **A Vuetify alias needs no hand-written safelist entry.** `vuetify.config.ts` maps every alias from Vuetify's own list, and `uno.config.ts` safelists what it maps.
- **A library component names an icon by meaning** — `<UiIcon :meaning="UiIconMeaning.Remove" />` — and a new meaning is a `UiIconMeaning` member plus a class in every style's row of `UiIconMap`: standard's a Lucide class, voxel's a Pixelarticons one or an `i-mdi:` class where the pixel set has no glyph. A feature still on Vuetify keeps passing `i-mdi:` names to Vuetify's icon props.
- **An icon stays at `size-6` in every style**: the box is the layout's, a pixel icon needs it to land on whole pixels, and a Lucide one in the same box keeps a row lined up. A label is passed only when the icon says something nothing beside it does.
- **Every row of a list is drawn by `UiItemContent` inside a `ui-item`** — mark, title, shortcut on one line — and leads with a mark; `UiItem` and `UiCommand` refuse a row with none at the typecheck.
- **A menu's action names its icon by meaning too**: a `UiItem` with `meaning`, which `UiOverflowMenu` and the context menu draw per style; `icon` stays for a glyph no meaning names, and a set's own class never appears in a feature.
- **A test finds an icon by `[class~="i-mdi:close"]`**, never `.i-mdi:close`, which is a pseudo-class selector, not a class.

## Components

What exists, what each is built on and its keyboard contract are the architecture page's Components section. The rules an edit follows:

- **A new component comes with a component test of its keyboard and ARIA contract**, mounted with the real Vuetify 0 parts rather than mocked ones. A feature's test never re-tests them.
- **A surface is a rule, not a style block.** `ui-frame`, `ui-lifted`, `ui-raised`, `ui-sunk`, `ui-pill`, `ui-popover` and `ui-item` live in `uno.config.ts`, since a primitive's part can only be dressed by class. A component that draws a surface wears the rule instead of restating its shadows.
- **Anything pressed wears `ui-button`**: `UiButton`, or `UiButtonLink` for somewhere to go, which stays a real link. A `NuxtLink` dressed by hand as a button restates the variants.
- **A utility cannot recolour a surface**: a `bg-*` or `text-*` written on `ui-frame`, `ui-raised` or `ui-sunk` loses to it (why is the architecture page's "What building them taught"). A state that recolours one is a data attribute the component's scoped style reads.
- **A field is `UiTextField` inside a `UiForm`**, passed `useVRules` rules as they are: validation stays Vuetify's until retirement, and the field adapts each rule to the primitive. The form's `isValid` is false only once a field has failed, so a submit button can stand disabled on it.
- **A choice between views of one thing is `UiTabs`**, keyed to a model — a route query where the view should survive a reload. Tabs that go somewhere — a docs category — are `UiTabLinks`, real links whose current one the call site names; a group in a navigation that opens and closes is `UiCollapsible`.
- **The call site's attributes go on top of the primitive's.** When a primitive overrides what a call site passes — as the button does with `type` and `aria-pressed` — render the element from its attribute slot with `$attrs` spread after, and expose the element if something must focus or anchor to it.
- **A field's completions are `UiSuggestions` beside the field, never a menu.** Focus stays in the field; a menu moves focus into itself and is for actions.
- **A menu item is data** — a `UiMenuItem` list — so a context menu and an overflow button can share one list later. A command already under way is a disabled item, never a hidden one, and a family of commands — one per export format — is a flat group named by verb and member, never a submenu.
- **A confirmation before something destructive is a `UiConfirmDialog`** once what it shows is the library's; until then it stays a `StyledDeleteFormDialog`.
- **A modal stays on Vuetify's overlay until its content is library-only.** Vuetify 0's dialog is in the top layer, where every Vuetify menu, select and tooltip its content opens renders underneath and inert. The dialog shell and the page drawers wear the library's look over Vuetify's behaviour; a popover is not modal, so its content is the library's own and holds nothing that opens a Vuetify overlay.
- **A name shown on hover is a `UiTooltip`**, its activator props bound onto the element, never a `title` attribute, which the browser draws in its own look.
- **A search of a surface's own is a scope of the one palette**: `useCommandScope` with its query and what it finds as `UiCommand` rows, never a dialog, a dropdown or a Ctrl+K of its own. A page that leads with its search opens the palette from `AppSearchButton`, drawn as the field it opens.
- **A keyboard shortcut is a registered command**: `useCommands` binds it for as long as its surface is mounted and lists it in the shortcuts dialog, so never a `useVHotkey` or keydown listener of a feature's own. A key the surface handles itself, such as a composer's Enter, is a command with neither `run` nor `to`, listed and never bound. A key held for as long as it acts, such as push-to-talk, is not a shortcut.
- **Right-click actions go through the one context menu**: bind `useContextMenu`'s props with the same `Item` list a `UiOverflowMenu` shows, never a menu positioned by hand. Bind them only where the list has items — the props take the browser's own menu away whether or not ours opens.
- **A toast goes through the app's one stack** (`AppToastStack`), as a `UiToast` fed by the store that owns that kind of toast — never a snackbar of its own.
- **A fixed region starts past the dock**: subtract `--dock-inset-inline-start` and `--dock-inset-block-end`, never a bar's height.

## The document chrome

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.scss`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed. A region in another theme is a `UiThemeScope`, never a palette set on its root; the chrome follows it.

## The design pass

The migration is a revamp of the design system, not a repaint. Before a unit or a library component is built, and again before it is handed over, walk `references/design-pass.md`: motion on whatever appears or disappears, placement from what the surface is for, the full width used, one thing to do first, every state designed, a signature detail drawn through the library rather than by hand, and a reason it beats the reference product rather than only matching it.

## Migrating a unit

Write down every flow and state a unit has before touching its template; the unit fails if the new version drops any of them. A unit may redesign across page boundaries — merge, split or move pages — as long as every inventoried flow keeps a place, every old route redirects, and the flow map is regenerated in the same commit with `pnpm flow-map:gen` from `apps/web` — its test fails on a stale one (the proposal index's "Licence to redesign"). The steps and the order of units are the proposal's `page-migration.md`; progress is the "ui-library" ledger in `.agents/ledgers/`, run by the `sweeps` skill, so a unit's commit carries its flow inventory in the body and `Ledger: ui-library | <unit>` as a trailer. A Styled wrapper a unit still needs keeps working for the units that have not moved; where the unit needs the library's version first, that is a new library component, and the wrapper retires with its last consumer. The exception is a wrapper that draws a button or a dialog's action row: it already renders the library's button behind its Vuetify props, so a unit replaces it with `UiButton` itself rather than leaving it in place (the proposal's `components.md`, "The Styled wrappers"). The units still open wait for the tonal standard (the proposal's `tonal-standard.md`), so they are migrated once into the look they keep.
