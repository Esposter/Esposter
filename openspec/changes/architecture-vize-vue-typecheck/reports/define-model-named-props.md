# content-mapper: `defineModel()` beside `defineProps<Props>()` reads the model key from a type that lacks it (TS7053)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

`defineProps<Props>()` with a type named `Props`, plus `defineModel()`, gives TS7053 on the model key. `vue-tsc` accepts the same file.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, the repository's pinned Node, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.638.0",
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
  "include": ["src/**/*.vue"]
}
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
interface Props {
  foo: string;
}

defineProps<Props>();
defineModel<boolean>();
</script>

<template>
  <div />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error. The position is in the generated code, which has no place in the source file:

```
src/Probe.vue(62,22): error TS7053: Element implicitly has an 'any' type because expression of type '"modelValue"' can't be used to index type '__DefineProps<Props, never>'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const bar = defineModel<boolean>(); bar.value = "baz";` gives TS2322 in both tools.

## Cause

The cause is likely: the template reads `Props`, and the model key exists only in `$ResolvedProps`. The source is read at the tag `v0.638.0` of `ubugeeei-prod/vize`.

`hoisted_props_alias_replaced` returns false when the `defineProps` argument is exactly `Props` (`crates/vize_canon/src/virtual_ts/props.rs:156`):

```rust
let names_props = inner == "Props"
```

So `template_model.rs:67` takes the `else` branch and the template contract is `Props`. The same case in `props.rs:118` puts the model into a different alias:

```rust
ts.push_str("type $ResolvedProps = Props & ");
```

The model loop at `template_model.rs:321-335` still emits `const modelValue = props["modelValue"]` against `Props`, which has no such key. A type with another name takes the `export type Props = … & model` branch, so the key exists. A generic component reads `$SetupProps`, and a setup variable with the key's name skips the emission. These two cases remove the error too.

The fix is likely to make the template read `$ResolvedProps` when the SFC has a model and `defineProps` names `Props`.

## Real occurrence

The shape in a real Nuxt app: [`Resource/RenameDialog.vue` lines 8 to 14](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Resource/RenameDialog.vue#L8-L14) has `interface Props`, `defineModel` and `defineProps<Props>()`. `vue-tsc` accepts it. Many components in the app have this shape.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.638.0, `tsrs` and `vue-tsc`:

| Change                                        | `tsrs` | `vue-tsc` |
| :-------------------------------------------- | -----: | --------: |
| None                                          |      1 |         0 |
| The interface is named `FooProps`             |      0 |         0 |
| `generic="T extends string"` and `foo: T`     |      0 |         0 |
| `const modelValue = defineModel<boolean>()`   |      0 |         0 |
| Inline type: `defineProps<{ foo: string }>()` |      0 |         0 |

## Not known

Versions before 0.638.0 are not tested for this input. The fix is read from the source and not applied.

## Not a duplicate of

Searched open and closed issues and pull requests for `defineModel`, `modelValue`, TS7053 and `__DefineProps`. The search matches words, not meaning. The nearest are #7949 (closed; every `defineModel()` is `never` for a file outside the tsconfig directory) and #10196 (closed; a binding named `props` collides with the mapper's own name). The inputs differ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
