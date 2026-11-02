# content-mapper: `defineComponent(…) as typeof Foo` gives TS2352 for any `.vue` component when `ComponentCustomProperties` has a `` `$${string}` `` index signature

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue comes from the first step, the type check, and is one of a few I ran into. A first run of this check on the app reported 103 diagnostics that `vue-tsc` does not report. The twelve issues of the first batch are closed, and a run on `vize` 0.652.0 reported 15. This issue explains some of those 15.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

A cast of a `defineComponent` stub to the type of a `.vue` component gives TS2352 when `ComponentCustomProperties` has the index signature ``[key: `$${string}`]: unknown``. The plugin typing that Nuxt generates in `.nuxt/types/plugins.d.ts` gives `ComponentCustomProperties` this signature (see #10195). `vue-tsc` accepts the same file.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux x64. Source of truth: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error. On `vize` 0.652.0 and 0.653.0 (macOS on Apple silicon), the reproduction below gives the same diagnostics at the same positions. `vue-tsc` reports none.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.650.0",
    "vue": "3.5.44",
    "vue-tsc": "3.3.11"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/augment.d.ts`:

```ts
import "vue";

declare module "vue" {
  interface ComponentCustomProperties {
    [key: `$${string}`]: unknown;
  }
}
```

`src/Foo.vue`:

```vue
<template>
  <div />
</template>
```

`src/Probe.ts`:

```ts
import { defineComponent } from "vue";
import Foo from "./Foo.vue";

export const Bar = defineComponent({}) as typeof Foo;
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error. The type names in it come from the generated code.

```
src/Probe.ts(4,20): error TS2352: Conversion of type 'DefineComponent<{ $props: Props; __vizeRawProps?: Props | undefined; $emit: (event: string, ...args: any[]) => void; $slots: Readonly<InternalSlots>; }, any, ..., ... 16 more ..., any>' to type '{ readonly __vizeComponentMarker: true; readonly __vizeRawProps?: Props | undefined; readonly __vizeNativeFallthroughRoot: true; readonly __vizeHasFallthroughProps: true; readonly __vizeFallthroughProps?: ... | undefined; } & $ComponentConstructor & $VueComponentOptions' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'DefineComponent<{ $props: Props; … }, any, ..., ... 16 more ..., any>' is not comparable to type '{ readonly __vizeComponentMarker: true; … }'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `export const Baz: number = "baz";` to `src/Probe.ts` gives TS2322 in both tools. `tsrs` still reports the TS2352 error as well.

## Cause

The cause is `$ComponentPublicBase`: `Omit` removes the public instance members when `ComponentCustomProperties` has a `` `$${string}` `` key. The source is read at the tag `v0.653.0` of `ubugeeei-prod/vize`.

The alias is `crates/vize_canon/src/virtual_ts/component_prop_helpers.txt:31` (shipped as `npm/cli/virtual-ts-globals.d.ts:309-313`):

```ts
type $ComponentPublicBase = Omit<import("vue").ComponentPublicInstance, "$props" | "$emit" | "$slots">;
```

Every generated `.vue` component type includes it. The instance ends with `} & $ComponentPublicBase;` (`crates/vize_canon/src/virtual_ts/generator/legacy_vue2/instance.rs:83`).

`Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`. With the index signature, `keyof ComponentPublicInstance` is the single type `` `$${string}` ``, because the key absorbs the literal `$el`, `$data` and the other `$` keys. A check in a `.ts` file shows it: `keyof ComponentPublicInstance` is `` `$${string}` `` and `Omit<ComponentPublicInstance, "$props" | "$emit" | "$slots">["$el"]` is `unknown`. So `$ComponentPublicBase` keeps only the index signature and the component type has no `$el`, `$data`, `$refs` and the other members.

The stub from `defineComponent` has those members and has no `__vizeComponentMarker`. This is likely why the cast is not comparable in either direction. The call `defineComponent({})` takes its props type from the contextual type of the cast. This is why the type name in the message contains `__vizeRawProps` and `$props`.

The cause is confirmed by a patch to a copy of the installed helpers (`virtual-ts-globals.d.ts` and `generated/content-mapper-types.d.ts`). The patch uses a key-remapped type, which keeps the literal keys:

```ts
type $ComponentPublicBase = {
  [
    K in keyof import("vue").ComponentPublicInstance as K extends "$props" | "$emit" | "$slots" ? never : K
  ]: import("vue").ComponentPublicInstance[K];
};
```

With the patch the reproduction gives no error. The same collapse was fixed for `$ReplaceComponentProps` with `$LiteralKeys` (`npm/cli/virtual-ts-globals.d.ts:278`). The helper `$MappedOmit` (`npm/cli/virtual-ts-globals.d.ts:115`) has the same shape as the patch.

The fix is likely to define `$ComponentPublicBase` with `$MappedOmit` in place of `Omit`.

## Real occurrence

https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Message/RightSideBar/Search/Input.test.ts#L23-L25

## Isolation

One change at a time from the reproduction. Errors on `vize` 0.650.0:

| Change                                                      | `tsrs` | `vue-tsc` |
| :---------------------------------------------------------- | -----: | --------: |
| None                                                        |      1 |         0 |
| Remove `src/augment.d.ts`                                   |      0 |         0 |
| Index key `string` in place of `` `$${string}` ``           |      0 |         0 |
| Index key `` `_${string}` `` in place of `` `$${string}` `` |      0 |         0 |
| Index value `any` in place of `unknown`                     |      1 |         0 |
| Index value `string` in place of `unknown`                  |      1 |         0 |
| `{} as typeof Foo` in place of `defineComponent({}) as …`   |      0 |         0 |
| `defineComponent({}) as unknown as typeof Foo`              |      0 |         0 |
| `Foo.vue` has `defineProps` and `defineEmits`               |      1 |         0 |
| `Foo.vue` has a component as its root                       |      1 |         0 |
| The target is a component from a `.ts` file                 |      0 |         0 |

The first reproduction gives one error on `vize` 0.638.0, 0.645.0 and 0.651.0.

## Not known

The real app also reports TS2590 ("Expression produces a union type that is too complex to represent") at the same expression. The index signature does not cause it. A second input reproduces TS2590 alone. It has 300 or more members in `ComponentCustomProperties` (for example `prop0: string;` to `prop299: string;`), a `.vue` component without `defineProps`, and the same cast. With 250 members, `vue-tsc` and `tsrs` report no error. With 300 members, `tsrs` reports TS2590 and `vue-tsc` reports no error.

A component with `defineProps` does not report it. The patch above does not remove it. The cause of TS2590 is not known and it needs its own report. Versions before 0.638.0 are not tested. The fix is read from the source and the patch is not applied to the Rust source.

## Not a duplicate of

Searched open and closed issues and pull requests for `ComponentPublicBase`, `ComponentCustomProperties`, `__vizeComponentMarker`, TS2352 and TS2590. The search matches words, not meaning. The nearest is #10195 (closed). The same `` `$${string}` `` key made `Omit<__VizeComponentInstance, "$props">` drop `$emit`, which gave TS2345 on a component with an attribute and a listener. The fix there did not change `$ComponentPublicBase`, which still uses `Omit`. The input and the error differ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
