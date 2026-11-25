# Strict template attributes — design

## The probe

The probe declared every attributify name the templates use on `vue`'s `HTMLAttributes`, `SVGAttributes` and `AllowedComponentProps`, and turned `checkUnknownProps` on. The app's errors fell from thousands to a few dozen, and none of the remainder was attributify. When the names were typed `boolean | string` instead of `unknown`, a few dozen more errors appeared: a name that UnoCSS also reads as a utility (`rows`, `row`, `max`) intersected a component's own prop type down to `never`. The remaining errors, by cause:

| Cause                                                                     | Instances                                                                                                         | Resolution                                                                |
| :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| A generic component's check reads a camelCase `data-*` attribute          | `dataVariant` in `Ui/Tabs`, `dataItemId` in `Ui/Tree`                                                             | the `data-*` patterns declared once on `AllowedComponentProps`            |
| An attribute or DOM property missing from Vue's types                     | `popover`, `popovertarget`, `srcObject`                                                                           | declared on the element interfaces that carry them                        |
| A layout's prop passed through `<NuxtLayout>`                             | `isViewportHeight`, `isRightTitleHidden`, `isServiceMenuShown`                                                    | `<NuxtLayout>`'s declaration pointed at one typed from the layouts        |
| A hydration prop that Nuxt's `Lazy*` type drops                           | `hydrate-on-idle` on a `Lazy*` component                                                                          | declared for components                                                   |
| A component named like the global it wraps, read as a reference to itself | `limit` in `Post/Description/RichTextEditor.vue`, whose `<RichTextEditor>` the checker reads as the file itself   | the file renamed to `Post/Description/Editor.vue`                         |
| An undeclared prop that a wrapper passes through to its root              | `isTall` on `StyledDialog`, `variant` on two menus, `focusPosition` on the message composer, `type` on `UiButton` | the wrapper declares the prop                                             |
| A utility UnoCSS generates nothing for                                    | `transition="[…_var(…)]"` in four templates                                                                       | a rule that reads the arbitrary value as the whole `transition` shorthand |

## Decisions

**The names come from UnoCSS's generator run over the templates, not from a grammar.** A name is declared when the app's own UnoCSS config generates CSS for it somewhere in a template, which is the same test the build applies. A misspelled utility generates nothing, so it is never declared and the check reports it. `apps/web/modules/attributifyTypes.ts` extracts every template's tokens, generates once over all of them, and reads each attribute name off the selectors the generator matched.

- _Rejected:_ a template-literal index signature such as ``[key: `${string}-${string}`]: unknown``. It would silence the errors but accept every typo, so the check would catch nothing.
- _Rejected:_ extending UnoCSS's `AttributifyAttributes`. It covers only part of the grammar, and neither hyphenated valueless utilities nor the app's shortcuts.

**The names are typed `unknown`.** `T & unknown` is `T`, so a name the generator declares never changes the type of a prop that a component already declares under the same name.

- _Rejected:_ `boolean | string`, which turned a component's `rows: number` into `never`.

**The declaration is a Nuxt type template, generated at `nuxt prepare` and under `nuxt dev`, and never committed.** `apps/web`'s `typecheck` already runs `nuxt prepare` first, and a type template written to `.nuxt/` is included in every program Nuxt generates. The commit holds nothing beyond what the templates already hold, so nothing can go stale and no freshness check is needed ([write-once](../../../specs/architecture/write-once/design.md)). A build and a test run write types nothing reads, so neither pays for it. Under `nuxt dev` it is rewritten only when Nuxt regenerates its templates, so a name first written mid-session may wait for the next regeneration or restart.

- _Rejected:_ a committed declaration with a CI freshness check, like `auto-imports.d.ts` has. That is a second copy of what the templates say, and it needs a gate to stay true.

**A transition is the shorthand the styling convention already writes.** The styling skill writes a transition as `transition="[opacity_var(--ui-motion-short)]"`, each property beside the motion token that carries its duration and easing, and UnoCSS reads `transition-[…]` as a property list and generates nothing for it. One rule in `apps/web/uno.config.ts` reads an arbitrary `transition` value with a space in it as the whole shorthand, so the convention generates CSS everywhere it is written rather than being respelt at each site.

- _Rejected:_ respelling each site as a `class="[transition:…]"` arbitrary property. It breaks the rule that arbitrary values are attributes, and leaves the documented form silently inert for the next template that writes it.

**A wrapper that passes a prop to its root declares it.** At runtime Vue lets an undeclared attribute fall through to a component's root, so `is-tall` on `StyledDialog` works. But the contract it relies on is invisible: nothing says `StyledDialog` takes `isTall`, and renaming the root's prop breaks it silently. Declaring the prop lets the check hold the contract. `UiButton`'s `type` falls back to the primitive's own `button` when none is named, so declaring it never turns a button into a form's submit.

- _Rejected:_ leaving the check off for wrappers, which would leave every stale prop on them undetected.

**Nuxt's and Vue's missing types are declared, not worked around at the call site.** `<NuxtLayout>` is typed with only `name` and `fallback`, so `apps/web/modules/nuxtLayoutTypes.ts` points its declaration at `app/types/NuxtLayout.d.ts`, which takes every layout's own props. It is one object rather than a union keyed by `name`, because the template's prop check reads only the keys every member of a union shares. A `Lazy*` component's type intersects the hydration strategies with the component's own, and vize's check reads only the SFC's props of such an intersection ([vize#13689](https://github.com/ubugeeei-prod/vize/issues/13689)), so the hydration strategies the app writes are declared for components in `app/types/nuxtLazyHydration.d.ts`. The DOM attributes Vue leaves out are declared in `app/types/vue.d.ts`. Each carries an `@TODO` on its upstream record, or the unfiled form where none exists, as the `todos` skill requires.

**`checkUnknownEvents` stays off.** A native listener a component does not emit, such as `@keydown` on a text field, falls through to its root. The probe declared the native handler props on `AllowedComponentProps`, but vize checks a listener against the component's own emits alone, so the declaration reached only the generic components, whose check reads `AllowedComponentProps`, and around twenty fall-through listeners still failed. Nothing a declaration can add reaches that check, so it stays off until vize reads fall-through listeners.

## Key files

| File                                        | Role                                                                                    |
| :------------------------------------------ | :-------------------------------------------------------------------------------------- |
| `apps/web/configuration/typescript.ts`      | the strict template options, `checkUnknownProps` on among them                          |
| `apps/web/modules/attributifyTypes.ts`      | the module that writes the attributify type template                                    |
| `apps/web/modules/nuxtLayoutTypes.ts`       | the module that points `<NuxtLayout>`'s declaration at the layouts                      |
| `apps/web/app/types/NuxtLayout.d.ts`        | `<NuxtLayout>` typed from every layout's props                                          |
| `apps/web/app/types/vue.d.ts`               | the DOM attributes Vue leaves out, and `data-*` for components                          |
| `apps/web/app/types/nuxtLazyHydration.d.ts` | the hydration strategies a `Lazy*` component's type drops                               |
| `apps/web/uno.config.ts`                    | the config whose generator decides which names exist, and the transition shorthand rule |
