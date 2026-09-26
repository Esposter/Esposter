# Theme utilities available as attributify

Read when reaching for a type size, a token or palette colour, a named opacity, or checking whether a colour name generates a utility at all. `presetAttributify()` is active in `uno.config.ts`, so every utility below works as a standalone attribute; links and state variants are `references/links.md` and `references/state-variants.md`.

- **Type is the library's four rules** — `ui-display`, `ui-heading`, `ui-title`, `ui-body` (`ui-library` skill). There is no second type scale: a Material role such as `text-body-small` or `text-caption` generates nothing.
- **Colours are the tokens**, each a `bg-*`, `text-*` and `b-*` utility reading its `--ui-*` custom property, so it follows the selected theme: `text-accent`, `bg-panel`, `b-border`, `text-error`, `text-info`, and the rest of `UiToken` (`apps/web/app/models/ui/UiToken.ts`).
- **A named opacity is a state, not an emphasis**: `op-disabled` for what cannot be used, `op-loading` for what is still on its way — never the number, since `op-38` is the named strength written out a second time and stops moving with it. The numeric scale is for what is genuinely no state, like the `op-0` → `group-hover:op-100` of a reveal.
- **De-emphasised text is `text-muted`, never a grey or a faded opacity** — `text-gray` resolves against preset-wind4's palette rather than the tokens, so it paints one fixed grey in both modes and drifts out of contrast in one of them, while `text-muted` is picked per style and mode against the surface it sits on.
- **The preset's own palette** — `text-amber`, `text-orange`, `bg-sky` — generates too, for what no token says (`ui-library` skill, "A colour is a token").

A name that is neither a token nor a preset colour generates nothing, and fails silently: `text-primary`, `bg-surface` and every other Material name included. `pnpm ai:unocss:generate` settles it when unsure (the `run-app` skill, `references/css-generation.md`). Registration is the `unocss` skill.
