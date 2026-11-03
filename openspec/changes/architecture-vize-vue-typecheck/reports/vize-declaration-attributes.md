content-mapper: the declaration refuses `id` and `role` in a vue-tsc consumer when the component has an emit

## Summary

A `.vue` declaration that the vize content mapper writes refuses the native attributes `id` and `role` in a `vue-tsc` consumer. The producer has one emit and no props. `tsrs` with the vize mapper accepts the same declaration, and `vue-tsc` accepts its own declaration of the same source.

## Environment

- `vize` 0.663.0, the newest release. The same result on 0.587.0, 0.638.0, 0.659.0, 0.661.0 and 0.662.0 (see Isolation).
- `tsrs` 0.20.1-ts7.1.0-beta, with `typescript` 7.1.0-beta in the producer.
- `vue-tsc` 3.3.11 with `typescript` 6.0.3 and `vue` 3.5.44 in the consumer.
- Node v26.13.0, pnpm 12.16.1, macOS 27.0.1 on Apple silicon.
- Source of truth: `vue-tsc` checks its own declaration of the same source (control B). `tsrs` checks the mapper declaration (control A).

## Reproduction

The project has three folders: `producer`, `consumer` and `vuetsc-producer`. Each folder has its own `package.json`. The root `pnpm-workspace.yaml` lists no packages, and every install passes `--ignore-workspace` and `--config.minimumReleaseAge=0`. Without the second flag, pnpm 12.16.1 refused the `vize` 0.663.0 packages as too new (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`).

`pnpm-workspace.yaml`:

```yaml
packages: []
```

`package.json`:

```json
{ "name": "vize-decl-repro", "private": true, "type": "module" }
```

`producer/package.json`:

```json
{
  "name": "producer",
  "private": true,
  "type": "module",
  "devDependencies": { "tsrs": "0.20.1-ts7.1.0-beta", "typescript": "7.1.0-beta", "vize": "0.663.0", "vue": "3.5.44" }
}
```

`producer/tsconfig.decl.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./out-tsrs",
    "rootDir": "./src",
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "types": []
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/Foo.vue"]
}
```

`producer/src/Foo.vue`:

```vue
<script setup lang="ts">
defineEmits<{ bar: [] }>();
</script>
```

`consumer/package.json`:

```json
{
  "name": "consumer",
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.663.0",
    "vue": "3.5.44",
    "vue-tsc": "3.3.11"
  }
}
```

`consumer/tsconfig.json` (for `vue-tsc`):

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
  "include": ["src/**/*.vue"]
}
```

`consumer/tsconfig.tsrs.json` (for `tsrs` with the mapper):

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "types": []
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.vue"]
}
```

`consumer/src/Probe.vue`:

```vue
<script setup lang="ts">
import Foo from "./vendor/Foo.vue";
// A real error in the consumer. Every run that reads Foo.vue.d.ts reports it.
const probe: number = Foo;
</script>

<template>
  <Foo id="r" />
</template>
```

`vuetsc-producer/package.json` (control B):

```json
{
  "name": "vuetsc-producer",
  "private": true,
  "type": "module",
  "devDependencies": { "typescript": "6.0.3", "vue": "3.5.44", "vue-tsc": "3.3.11" }
}
```

`vuetsc-producer/tsconfig.json` (control B):

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./out",
    "rootDir": "./src",
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "include": ["src/**/*.vue"]
}
```

`vuetsc-producer/src/Foo.vue` (control B):

```vue
<script setup lang="ts">
defineEmits<{ bar: [] }>();
</script>
```

Commands. Run them in order from the project root. Each line in parentheses runs in its own folder.

Emit the mapper declaration, then check the consumer with `vue-tsc`:

```sh
(cd producer && pnpm install --ignore-workspace --config.minimumReleaseAge=0 && pnpm exec tsrs --runExternalCode -p tsconfig.decl.json)
mkdir -p consumer/src/vendor && cp producer/out-tsrs/Foo.d.vue.ts consumer/src/vendor/Foo.vue.d.ts
(cd consumer && pnpm install --ignore-workspace --config.minimumReleaseAge=0 && pnpm exec vue-tsc --noEmit -p tsconfig.json)
```

Control A, the same declaration checked by `tsrs` with the mapper:

```sh
(cd consumer && pnpm exec tsrs --noEmit --runExternalCode -p tsconfig.tsrs.json)
```

Control B, the declaration `vue-tsc` writes for the same source, checked by `vue-tsc`:

```sh
(cd vuetsc-producer && pnpm install --ignore-workspace --config.minimumReleaseAge=0 && pnpm exec vue-tsc --declaration --emitDeclarationOnly -p tsconfig.json)
cp vuetsc-producer/out/Foo.vue.d.ts consumer/src/vendor/Foo.vue.d.ts
(cd consumer && pnpm exec vue-tsc --noEmit -p tsconfig.json)
```

Control C, the declaration `vize check --declaration` writes, checked by `vue-tsc` (the path that #11477 changed):

```sh
(cd producer && pnpm exec vize check --declaration --declaration-dir ./out-vizecheck --tsrs-path ./node_modules/.bin/tsrs --tsconfig tsconfig.decl.json src/Foo.vue)
cp producer/out-vizecheck/Foo.vue.d.ts producer/out-vizecheck/__vize_helpers.d.ts consumer/src/vendor/
(cd consumer && pnpm exec vue-tsc --noEmit -p tsconfig.json)
```

## Actual

The reproduction, `vue-tsc` 3.3.11 on the mapper declaration. Line 4 of `Probe.vue` is the deliberate error. Line 8 is this bug. Its second output line gives the detail:

```
src/Probe.vue(4,7): error TS2322: Type '{ __vizeEmitProps?: $StaticEmitProps | undefined; __vizeRawEmits?: $AuthoredEventMap | undefined; __vizeEventMap?: { bar: () => any; } | undefined; readonly __vizeComponentMarker: true; readonly __vizeRawProps?: Props | undefined; readonly __vizeHasFallthroughProps: true; readonly __vizeFallthroughProps?: { ...; } |...' is not assignable to type 'number'.
src/Probe.vue(8,4): error TS2345: Argument of type '{ id: string; }' is not assignable to parameter of type '$AuthoredKeyWitness<{ id: string; }> & Partial<Props> & Partial<$KebabProps<Props>> & __EmitProps<Emits> & ... 8 more ... & Record<...>'.
  Property '__vizeInvalidComponentProps' is missing in type '{ id: string; }' but required in type '{ readonly __vizeInvalidComponentProps: { readonly missing: never; readonly extra: "id"; }; }'.
```

## Expected

The deliberate error is the only error. `id` and `role` pass, as they do in the controls.

## Controls

| Declaration                                | Checker                | Result                                |
| :----------------------------------------- | :--------------------- | :------------------------------------ |
| Mapper declaration (reproduction)          | `vue-tsc`              | TS2322 (deliberate) and TS2345 (`id`) |
| Mapper declaration (control A)             | `tsrs` with the mapper | TS2322 only                           |
| `vue-tsc` declaration (control B)          | `vue-tsc`              | TS2322 only                           |
| `vize check --declaration` declaration (C) | `vue-tsc`              | TS2322 only                           |

## Cause

The guard in `virtual-ts-globals.d.ts` decides the extra keys. The mapper declaration imports `vize/virtual-ts`, which loads this file. The file is `npm/cli/virtual-ts-globals.d.ts` at tag `v0.663.0`, and it matches the installed 0.663.0 file.

The allowed set (lines 193 to 199):

```ts
type $ComponentInputProps<T, Declared = {}> = T extends unknown
  ? Partial<T> & Partial<$KebabProps<T>> & Declared & $FallthroughAttrs<T & Declared> & $PublicComponentInputProps
  : never;
```

The fallthrough attributes (lines 151 to 156) cover `class`, `style`, `data-*`, `aria-*` and the `on*` listeners. They do not cover native names such as `id`, `role` or `disabled`.

The extra keys (lines 230 to 240) are the keys that the allowed set does not have:

```ts
  type $ExtraInputKeys<
    T,
    Declared,
    Authored,
    Allowed,
    K extends keyof Authored = Exclude<keyof Authored, keyof Allowed>,
  > = K extends unknown
```

The relaxation (lines 217 to 229) applies only when `keyof Declared` is `never` and the component has one required prop. A component with an emit has a non-empty `keyof Declared`, so the guard reports every key outside the allowed set. The native names are in `$ComponentGlobalHtmlAttrs` (lines 332 to 338), and the allowed set does not include it.

A type probe on the same helpers confirms this. For one emit and an authored `id`, `$ExtraInputKeys` gives `"id"`. For an authored `class`, it gives `never`.

A copy of `virtual-ts-globals.d.ts` with `$ComponentGlobalHtmlAttrs &` added after line 197, before `$PublicComponentInputProps`, clears the `id`, `role` and `disabled` errors. It keeps the error for `custom-attr` and the declared-prop error for `:configuration="1"`. The copy is a test only.

The one-sentence change: add `$ComponentGlobalHtmlAttrs` to the intersection in `$ComponentInputProps`.

## Real occurrence

https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/packages/genshin-world/src/components/Domain/Screen/Row/Index.vue#L33

## Isolation

One change at a time from the reproduction's shape (`vize` 0.663.0, mapper declaration). Each cell gives the number of `vue-tsc` errors for that attribute.

| Producer (`Foo.vue`)                                                                                    | `id` | `role` | `class` |
| :------------------------------------------------------------------------------------------------------ | ---: | -----: | ------: |
| Empty template, emit with `/** @vue-ignore */`, `configuration` prop, `immediate?: true`, function prop |    1 |      1 |       0 |
| Single root `<div />` in place of the empty template                                                    |    1 |      1 |       0 |
| Emit without `/** @vue-ignore */`                                                                       |    1 |      1 |       0 |
| No `immediate` prop                                                                                     |    1 |      1 |       0 |
| No function prop                                                                                        |    1 |      1 |       0 |
| No `defineEmits` (no emit)                                                                              |    0 |      0 |       0 |
| `bar: number` and emit `change`, empty template                                                         |    1 |      1 |       0 |
| `bar: number`, no emit                                                                                  |    0 |      0 |       0 |
| `bar` and `baz` required, emit `change`                                                                 |    1 |      1 |       0 |
| `bar` and `baz` required, no emit                                                                       |    0 |      0 |       0 |
| Emit only, no props (the reproduction)                                                                  |    1 |      1 |       0 |

The attribute names on the reproduction (0.662.0): `id`, `role`, `title`, `hidden`, `disabled` and `custom-attr` each give 1 error. `class` gives 0.

Versions. The mapper declaration and the `vize check --declaration` declaration, each on the reproduction:

| `vize`  | Mapper declaration | `vize check --declaration` |
| :------ | :----------------- | :------------------------- |
| 0.587.0 | refused            | not run                    |
| 0.638.0 | refused            | refused                    |
| 0.659.0 | refused            | refused                    |
| 0.661.0 | refused            | accepted                   |
| 0.662.0 | refused            | accepted                   |
| 0.663.0 | refused            | accepted                   |

## Not known

- A build with tsdown, rolldown-plugin-dts and the tsgo generator writes the same guard lines. That build was not run here. The guard lines were read in one such bundle, not run.
- A component with two required props and no emit accepts `id`, and it accepts a missing `baz`. The type probe gives `"id"` as the extra key for that shape, so the cause of the accepted `id` is not known.
- The fix is tested in a copy only. Its effect on the mapper's own template checks was not run.
- The versions between the tested releases were not run.

## Not a duplicate of

- #11364 (closed issue). Same symptom, reduced to one required prop and no emit. That shape passes on the mapper declaration too, so it cannot show this bug.
- #11454 (closed issue, closed by #11477). Same symptom with an emit, but on the `vize check --declaration` path. That path is accepted from 0.661.0 on. This report is the mapper path, which is refused from 0.587.0 through 0.663.0.
- #11477 (merged pull request). It changes `crates/vize_canon/src/batch/executor/declaration_helpers.rs` only. Its description says that the mapper's helpers do not change. The guard in this report is in `virtual-ts-globals.d.ts`.
- #11459 (closed pull request). An earlier change to the same guard, which dropped its extra-key half. #11477 replaced it.
- #11496 (closed issue). A consumer of a vendored `.vue.d.ts` in `vize check` reports nothing for a wrong prop value. That is a different false negative, in `vize check`.
- #5799 (closed pull request) and #9104 (closed pull request). #5799 added the native attribute surface to the mapper's own checks for generic components. #9104 gave the emitted declarations a stub `__VizeComponentGlobalHtmlAttrs` of `{ [key: string]: unknown }`. Neither gives the mapper declarations' consumers the native names.
- #11446 (closed issue). A generic component with `inheritAttrs: false` refuses an attribute (TS2353) in the mapper's own check. That is a different check.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
