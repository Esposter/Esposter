# Utility vocabulary

Read when choosing between two spellings of the same utility — an abbreviation, a named step against a numeric one, a directional gap, or a slash/fraction value. This page holds the whole rule; `SKILL.md` keeps what may be an attribute at all.

## Slashes / fractions → valued attributify (never bare, never `class`)

A utility containing `/` (`top-1/2`, `translate-y-1/2`) **cannot** be a bare attribute — the SFC parser reads the `/` as a tag terminator and fails with `Opening tag "div" not terminated` — and must not be dumped into `class="..."` to dodge that. Use the **valued** form with the minus inside the quotes: `<div top="1/2" translate-y="-1/2" translate-x="-1/2" />`, the valued analogue of the bare-scale negative rule (`top--1`) below.

## Abbreviated Utilities

Always use the UnoCSS abbreviated shorthand forms — they are first-class utilities, and when in doubt the shorter form is canonical here.

**Opacity (`op-` prefix):**

- `op-0`/`op-50`/`op-100` not `opacity-*`; works with variants (`group-hover:op-100`, `hover:op-80`, `disabled:op-30`).
- Prefer semantic utilities for non-obvious values: `op-medium-emphasis` → `var(--v-medium-emphasis-opacity)`, `op-high-emphasis` → `var(--v-high-emphasis-opacity)` (defining/safelisting new ones — see the `unocss` skill).
- Conditional semantic opacity utilities take boolean bindings: `:op-high-emphasis="!isLoading ? '' : undefined"`.
- Reserve raw numeric opacity for obvious visibility states (`0`, `0!`, `op-0`, `op-100`, `group-hover:op-100`). Avoid raw non-obvious values (`op-40`, `op-50`, `:op="80"`) in app UI; use semantic utilities or CSS variables.

**Spacing/position scale values:**

- Use UnoCSS scale tokens instead of explicit rem when the value is on the spacing scale (`1` = `0.25rem`, `2` = `0.5rem`, etc.).
- For negative values, put the double hyphen in the attribute name: `right--1`, `top--1`, `ml--2`. Do not write `right="-0.25rem"` or use `-right-1` in templates.
- Use arbitrary values only when off-scale or computed (`references/arbitrary-values.md`).

**Border (`b-` prefix)** — never the Vuetify `border="sm"` prop or `border-sm` class, and `b-solid` is never applied automatically. Both that rule and the one a directional border needs (`b-0 b-b-1`, never a bare `b-b-1`) are `references/layout.md`, along with why a global border reset is not the fix.

**Border-radius (`rd` prefix)** — never the Vuetify `rounded="sm"` prop or `rounded-sm` class: `rd` not `rounded`, `rd-t-2` not `rounded-t-2`, `rd-full` not `rounded-full`. Two mappings aren't a direct rename — Vuetify `rounded-xl` is `rd-3xl` (24px), and `rounded-circle` is `rd="50%"`.

**Background:** `bg-transparent` not `background-transparent`. **Outline:** `outline-none` not `outline-0` (sets `outline: 2px solid transparent`).

**Size (`size-` prefix)** — a `w-{n}` and an `h-{n}` on the same element with the **same** value collapse to one `size-{n}`: `size-8`, never `w-8 h-8`; `size-full`, never `w-full h-full`. The pair is only ever written out when the two values differ.

## Named Utilities Over Numeric

Prefer UnoCSS **named** utilities over numeric equivalents whenever a name exists:

- Font weight: `font-medium` / `font-semibold` / `font-bold` — never `font-500` / `font-600` / `font-700`.
- Transition duration: `duration-[--transition-duration]` (the global variable from `globals.scss`) — never a raw `duration-200`.
- Vuetify helper classes (`font-weight-medium`, `font-weight-bold`, …) are **not** UnoCSS utilities — as attributify attributes they generate nothing. Only the shortcuts registered in `uno.config.ts` work (MD3 typography, theme/palette colours, semantic opacity). Use the UnoCSS named form (`font-medium`) instead.

## Gap Directionality

Use axis-specific gap utilities instead of omnidirectional `gap-{n}`: **`flex` (row)** → `gap-x-{n}`; **`flex-col`** → `gap-y-{n}`; **`grid` / 2D layouts** → `gap-{n}` (both axes intentional).
