# What Stays in `class`

Read when a style seems to need `class` or a scoped rule rather than an attribute, or a utility is switched on a condition.

Only when technically required:

- **Scoped CSS refs** — class names referenced in `<style scoped>` (e.g. `class="card"`)
- **Dynamic bindings** — `:class="..."` always stays as-is, and a **valueless** utility switched on a condition belongs there rather than in a bound attribute. `:py="isCompact ? 0.5 : 1"` is fine: the extractor reads the literals and emits `[py~="0.5"]` and `[py~="1"]`. `:op-loading="isLoading ? '' : undefined"` is not — an empty string is no value, so nothing is emitted and the attribute lands on a rule only when some unrelated file happens to write that utility bare. It fails silently and comes back the day that file changes, so `apps/web/app/templates.test.ts` refuses the shape — the generator is what tells a utility from a prop the empty string is a real value for, which no selector can ask. `:class="isLoading ? 'op-loading' : undefined"` emits the class and depends on nothing
- **Third-party component classes** — e.g. `vue-flow__panel`
- **SVG classes** — e.g. `fclass1`, `a`, `b`
- **`group`** — UnoCSS group variant token; must stay in `class` so descendant `group-hover:` variants work

A scoped class (with `v-bind()` for reactive values) also stays correct where attributify cannot reach: structural pseudo-selectors (`:nth-child`, `:not()`, `:first-of-type`), `:deep()` rules, bare element/tag selectors, and non-colour reactive values (`transform`, `top`, `height`, `fill`, `animation`). Everything else — a class that only sets a theme colour, a hover colour, or arbitrary-value properties — is an attribute.
