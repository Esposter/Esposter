# Utility vocabulary

Read when choosing between two spellings of the same utility — an abbreviation, a named step against a numeric one, a directional gap, or a slash/fraction value. This page holds the whole rule; `SKILL.md` keeps what may be an attribute at all.

## Slashes / fractions → valued attributify (never bare, never `class`)

A utility containing `/` (`top-1/2`, `translate-y-1/2`) **cannot** be a bare attribute — the SFC parser reads the `/` as a tag terminator and fails with `Opening tag "div" not terminated` — and must not be dumped into `class="..."` to dodge that. Use the **valued** form with the minus inside the quotes: `<div top="1/2" translate-y="-1/2" translate-x="-1/2" />`, the valued analogue of the bare-scale negative rule (`top--1`) below.

## Abbreviated Utilities

Always use the UnoCSS abbreviated shorthand forms — they are first-class utilities, and the shortest spelling of a family is canonical here. **`BLOCKED_SPELLINGS` in `apps/web/uno.config.ts` is the one list of which spellings are refused** (`pa-` for `p-`, `overflow-` for `of-`, `font-bold` for `fw-bold`, `leading-` for `lh-`, `whitespace-` for `ws-`, `grid-cols-` for `cols-`, `-auto` for `-a`, and the rest), the generator emits nothing for a blocked token, and `unocss/blocklist` reports the attribute that wrote one — so a spelling question below is settled by that list, and a new alias met in the tree joins it rather than this prose (`unocss` skill).

**Opacity (`op-` prefix):**

- `op-0`/`op-50`/`op-100` not `opacity-*`; works with variants (`group-hover:op-100`, `disabled:op-disabled`).
- Prefer the named states for what they name: `op-disabled`, `op-loading` (defining new ones — see the `unocss` skill).
- Switch a named opacity with `:class="isLoading ? 'op-loading' : undefined"` — bound to its own attribute it would carry the empty string, which generates nothing (`references/class-attribute.md`).
- Reserve raw numeric opacity for obvious visibility states (`0`, `0!`, `op-0`, `op-100`, `group-hover:op-100`). Avoid raw non-obvious values (`op-40`, `op-50`, `:op="80"`) in app UI; use semantic utilities or CSS variables.

**Spacing/position scale values:**

- Use UnoCSS scale tokens instead of explicit rem when the value is on the spacing scale (`1` = `0.25rem`, `2` = `0.5rem`, etc.).
- For negative values, put the double hyphen in the attribute name: `right--1`, `top--1`, `ml--2`. Do not write `right="-0.25rem"` or use `-right-1` in templates.
- Use arbitrary values only when off-scale or computed (`references/arbitrary-values.md`).

**Border (`b-` prefix)** — `b-1`, `b-b-1`, `b-border`, never a `border-*` spelling; what a width draws on its own is `references/layout.md`.

**Border-radius (`rd` prefix)** — `rd` not `rounded`, `rd-t-2` not `rounded-t-2`, `rd-full` not `rounded-full`, and `rd="50%"` for a circle.

**Background:** `bg-transparent` not `background-transparent`. **Outline:** a focus ring a tint replaces is `outline-hidden`, never `outline-none` — under `presetWind4` `outline-none` is `outline-style: none`, which forced colours cannot paint, so the focused element loses its only mark there, while `outline-hidden` restores a transparent outline inside `@media (forced-colors: active)` for the forced palette to paint in.

**Size (`size-` prefix)** — a `w-{n}` and an `h-{n}` on the same element with the **same** value collapse to one `size-{n}`: `size-8`, never `w-8 h-8`; `size-full`, never `w-full h-full`. The pair is only ever written out when the two values differ.

## Named Utilities Over Numeric

Prefer UnoCSS **named** utilities over numeric equivalents whenever a name exists:

- Font weight: `fw-medium` / `fw-semibold` / `fw-bold` — never `fw-500` / `fw-600` / `fw-700`, and never the longer `font-*` spelling the blocklist refuses.
- Transition timing: a motion token inside the `transition` value (`references/arbitrary-values.md`) — never a `duration-*` utility.

## Gap Directionality

Use axis-specific gap utilities instead of omnidirectional `gap-{n}`: **`flex` (row)** → `gap-x-{n}`; **`flex-col`** → `gap-y-{n}`; **`grid` / 2D layouts** → `gap-{n}` (both axes intentional).
