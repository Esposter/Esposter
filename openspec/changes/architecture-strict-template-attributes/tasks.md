# Tasks

## 1. Declarations

- [ ] 1.1 Write the Nuxt module that runs UnoCSS's generator over `app/**/*.vue` with the app's config at prepare, and writes a type template declaring every attribute name it matched on `vue`'s `HTMLAttributes`, `SVGAttributes` and `AllowedComponentProps`, in both kebab and camelCase spelling, typed `unknown`. Verified by its test, written first and seen failing, asserting that the name of a utility that generates CSS is declared and a misspelled one is not.
- [ ] 1.2 Declare `popover`, `popovertarget` and the video element's `srcObject` on the element interfaces that carry them. Verified by `pnpm typecheck` from `apps/web` reporting none of them with `checkUnknownProps` on.
- [ ] 1.3 Declare each layout's props on `NuxtLayout`, and the props the `.client.vue` and `Lazy*` wrappers drop, typed from the components' own props, each with an `@TODO` pointing at its upstream issue. Verified by `pnpm typecheck` reporting none of them.

## 2. Defects

- [ ] 2.1 Declare `isTall` on `StyledDialog`, `variant` on the call participant and invite row menus, and `focusPosition` on the message composer. Verified by `pnpm typecheck` reporting none of them.
- [ ] 2.2 Respell the four `transition="[…_var(…)]"` utilities so UnoCSS generates CSS for each. Verified by the module's generator listing each as matched, and by a driven-browser check of the checkbox's transition.

## 3. The check

- [ ] 3.1 Turn on `checkUnknownProps` in `apps/web/configuration/typescript.ts`. Verified by `pnpm typecheck` from `apps/web` passing.
- [ ] 3.2 Probe `checkUnknownEvents` with the native event-handler props declared for components. If the probe comes back clean, turn it on; otherwise keep it off and record why. Verified by `pnpm typecheck` passing either way.
- [ ] 3.3 Update the "TypeScript compiler" section of the monorepo-tooling design to the checks the app now runs, and archive this change. Verified by `pnpm exec openspec archive architecture-strict-template-attributes --yes` succeeding.
