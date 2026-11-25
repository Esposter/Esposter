# Strict template attributes

## Why

`apps/web` type-checks its templates with `vueCompilerOptions.strictTemplates`, but keeps `checkUnknownProps` and `checkUnknownEvents` off ([monorepo tooling](../../../specs/architecture/monorepo-tooling/design.md), "TypeScript compiler"). The unknown-prop check fires on every UnoCSS attributify utility, because no declaration names `flex-col` or `ui-title`, and UnoCSS's own `AttributifyAttributes` covers only part of the attributify grammar. So the check that catches a stale or misspelled prop is off for the whole app, while the Vue packages have it on.

A probe showed the check can be turned on. Declaring the attributify names the templates use removes nearly every error. What remains is a short list in which each entry is either a real defect or a type that Nuxt or Vue leaves out. Among them, four templates write a `transition` utility that UnoCSS generates no CSS for, so those transitions are silently missing today.

## What changes

- At `nuxt prepare`, a Nuxt module runs UnoCSS's own generator, with the app's config, over the app's templates and writes a type declaration of every attributify name they use. The declaration carries each name in both its kebab and camelCase spelling, typed `unknown`, so a name never narrows a prop that a component declares under the same name.
- The DOM attributes and properties missing from Vue's types (`popover`, `popovertarget`, `srcObject`) are declared, along with the layouts' props passed through `<NuxtLayout>` and the hydration props that Nuxt's lazy wrapper drops from a component's type. A component named like the global it wraps, which the check reads as a reference to itself, is renamed.
- A component that passes an undeclared prop through to its root declares that prop.
- The `transition` shorthand the styling convention writes, which UnoCSS generates nothing for, generates CSS.
- `checkUnknownProps` is turned on in `apps/web`. `checkUnknownEvents` stays off, because vize checks a listener against the component's own emits alone.

The only change an outsider sees is that the four transitions start working. This is a tooling change, so it carries no spec delta.

## Out of scope

- Typing attributify values. UnoCSS checks a utility's value by generating nothing for a value it does not know, and the generated names cannot say which values each utility accepts.
- The Vue packages. They use no attributify and already run the full strict check.
