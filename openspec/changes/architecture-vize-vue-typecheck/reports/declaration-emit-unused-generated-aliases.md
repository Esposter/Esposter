# check --declaration: with `noUnusedLocals`, the aliases written for a second use of a component are reported as unused (TS6196) and the emit fails

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

`vize check --declaration` exits 1 when the tsconfig has `noUnusedLocals` and a template uses one component twice. It reports TS6196 for the generated aliases of the second use, and it does not write `__vize_helpers.d.ts`.

## Environment

`vize` 0.638.0 with `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, the repository's pinned Node, Windows 11.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": { "tsrs": "0.20.1-ts7.1.0-beta", "typescript": "6.0.3", "vize": "0.638.0", "vue": "3.5.44" }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/Foo.vue`:

```vue
<script setup lang="ts">
defineProps<{ bar: number }>();
</script>

<template>
  <div />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import Foo from "./Foo.vue";
</script>

<template>
  <Foo :bar="1" />
  <Foo :bar="2" />
</template>
```

```sh
npm i && npx vize check --declaration --declaration-dir out src/Foo.vue src/Probe.vue
```

## Actual

The command exits 1. The positions are in the generated code:

```
Error: corsa error (exit code 2): src/Probe.vue.ts(68,8): error TS6196: '__Foo_Component_1' is declared but never used.
src/Probe.vue.ts(69,8): error TS6196: '__Foo_CheckProps_1' is declared but never used.
src/Probe.vue.ts(70,8): error TS6196: '__Foo_CheckTail_1' is declared but never used.
```

`out/Foo.vue.d.ts` and `out/Probe.vue.d.ts` are written and `out/__vize_helpers.d.ts` is not. The two declarations reference `vize:virtual-ts`, a module that exists only inside vize.

## Expected

No diagnostic and exit 0, as with the same command when `noUnusedLocals` is `false` or the template uses `Foo` once. Both variants write `__vize_helpers.d.ts`. `npx vize check src/Foo.vue src/Probe.vue` and `npx tsrs --runExternalCode --noEmit -p tsconfig.json` report no error for the reproduction.

## Cause

The mapper writes aliases for a use that shares the check types of an earlier use, and nothing reads them. They are `type __Foo_Component_1 = __Foo_Component_0;` and two more (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker.rs:101-113`):

```rust
if let Some(shared_idx) = shared_idx {
```

Under `noUnusedLocals`, an unused local type alias is TS6196. The fix for #4051 passes the effective `noUnusedLocals` to the mapper through its protocol, so the mapper path keeps the generated bindings from being reported. The `--declaration` path of the CLI likely does not take that route for these aliases. I did not confirm it in the source.

The fix is likely to keep diagnostics of generated aliases out of the `--declaration` run, as the other paths do, or not to write aliases that are not read.

## Real occurrence

The shape in real code: [`WorshipScreen/Index.vue` lines 45 and 83](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/packages/genshin-interface/src/components/WorshipScreen/Index.vue#L45-L83) use `GameButton` more than once. The package has `noUnusedLocals` on. `vize check --declaration` over its components reports this error for many of them and exits 1.

## Isolation

One change at a time from the reproduction. `vize check --declaration`, `vize` 0.638.0:

| Change                      | Exit | TS6196 | `__vize_helpers.d.ts` written |
| :-------------------------- | ---: | -----: | :---------------------------- |
| None                        |    1 |      3 | no                            |
| `noUnusedLocals: false`     |    0 |      0 | yes                           |
| One `<Foo>` in the template |    0 |      0 | yes                           |

## Not known

Versions before 0.638.0 are not tested for this input. The fix is read from the source and not applied. Why the other paths hide the diagnostic is not confirmed.

## Not a duplicate of

Searched open and closed issues and pull requests for TS6196, `noUnusedLocals` and `--declaration`. The search matches words, not meaning. The nearest are #4051 (merged; the mapper honours `noUnusedLocals`, and declaration emit under it was verified without TS6133 or TS6196 noise) and #2513 (closed; an unused Vue 2 emit helper under `noUnusedLocals`). The input here is a second use of one component, and it still reports the error on 0.638.0.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
