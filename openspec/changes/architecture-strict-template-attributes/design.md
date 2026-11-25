# Strict template attributes — design

## The probe

The probe declared every attributify name the templates use on `vue`'s `HTMLAttributes`, `SVGAttributes` and `AllowedComponentProps`, and turned `checkUnknownProps` on. The app's errors fell from thousands to a few dozen, and none of the remainder was attributify. When the names were typed `boolean | string` instead of `unknown`, a few dozen more errors appeared: a name that UnoCSS also reads as a utility (`rows`, `row`, `max`) intersected a component's own prop type down to `never`. The remaining errors, by cause:

| Cause                                                                                                    | Instances                                                                                   | Resolution                                                                      |
| :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| A generic component's check reads the camelCase name (`uiItem`, `pt2`) or a camelCase `data-*` attribute | a handful in `Ui/Select`, `Ui/Tabs`, `Ui/Tree`                                              | the generator emits both spellings, and the `data-*` patterns are declared once |
| An attribute or DOM property missing from Vue's types                                                    | `popover`, `popovertarget`, `srcObject`                                                     | declared on the element interfaces that carry them                              |
| A layout's prop passed through `<NuxtLayout>`                                                            | `isViewportHeight`, `isRightTitleHidden`, `isServiceMenuShown`                              | each layout's props declared on `NuxtLayout`                                    |
| A prop that Nuxt's wrapper drops from the component's type                                               | `limit` on a `.client.vue` component, `hydrate-on-idle` on a `Lazy*` component              | declared through the wrapper's type                                             |
| An undeclared prop that a wrapper passes through to its root                                             | `isTall` on `StyledDialog`, `variant` on two menus, `focusPosition` on the message composer | the wrapper declares the prop                                                   |
| A utility UnoCSS generates nothing for                                                                   | `transition="[…_var(…)]"` in four templates                                                 | respelt to a form that generates CSS                                            |

## Decisions

**The names come from UnoCSS's generator run over the templates, not from a grammar.** A name is declared when the app's own UnoCSS config generates CSS for it somewhere in a template, which is the same test the build applies. A misspelled utility generates nothing, so it is never declared and the check reports it.

- _Rejected:_ a template-literal index signature such as ``[key: `${string}-${string}`]: unknown``. It would silence the errors but accept every typo, so the check would catch nothing.
- _Rejected:_ extending UnoCSS's `AttributifyAttributes`. It covers only part of the grammar, and neither hyphenated valueless utilities nor the app's shortcuts.

**The names are typed `unknown`.** `T & unknown` is `T`, so a name the generator declares never changes the type of a prop that a component already declares under the same name.

- _Rejected:_ `boolean | string`, which turned a component's `rows: number` into `never`.

**The declaration is a Nuxt type template, generated at `nuxt prepare` and never committed.** `apps/web`'s `typecheck` already runs `nuxt prepare` first, and a type template written to `.nuxt/` is included in every program Nuxt generates. The commit holds nothing beyond what the templates already hold, so nothing can go stale and no freshness check is needed ([write-once](../../specs/architecture/write-once/design.md)). Generation takes seconds over the whole app. Its cost grows with the templates, and it is paid on a prepare that already reruns on every install and typecheck.

- _Rejected:_ a committed declaration with a CI freshness check, like `auto-imports.d.ts` has. That is a second copy of what the templates say, and it needs a gate to stay true.

**A wrapper that passes a prop to its root declares it.** At runtime Vue lets an undeclared attribute fall through to a component's root, so `is-tall` on `StyledDialog` works today. But the contract it relies on is invisible: nothing says `StyledDialog` takes `isTall`, and renaming the root's prop breaks it silently. Declaring the prop lets the check hold the contract.

- _Rejected:_ leaving the check off for wrappers, which would leave every stale prop on them undetected.

**Nuxt's wrapper types are declared, not worked around at the call site.** The layout props, the `.client.vue` props and the lazy-hydration props are Nuxt's to type. Where Nuxt's generated types drop them, one declaration states them, typed from the component's own props, with an `@TODO` pointing at the upstream issue as the `todos` skill requires.

## Key files

| File                                   | Role                                                            |
| :------------------------------------- | :-------------------------------------------------------------- |
| `apps/web/configuration/typescript.ts` | the strict template options, `checkUnknownProps` among them     |
| `apps/web/modules/`                    | the module that writes the attributify type template at prepare |
| `apps/web/uno.config.ts`               | the config whose generator decides which names exist            |

## Open questions

- Whether `checkUnknownEvents` can be turned on too. A listener that a component does not emit falls through to its root as a native listener, so the check needs the native event-handler props declared for components, the same way the attributes are. Its probe decides, and neither answer changes anything above.
