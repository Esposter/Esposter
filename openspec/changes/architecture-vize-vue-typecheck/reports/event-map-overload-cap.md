# content-mapper: a component with `defineModel` past sixteen events loses its earliest events from its event map (TS2339)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A component whose `defineEmits` keys and `defineModel` calls total more than 16 events loses its earliest events from `$StaticEventMap`. `tsrs` reports `TS2339` for each declared event that is missing. `vue-tsc` accepts the same file.

## Environment

`vize` 0.644.0, `tsrs` 0.20.1-ts7.1.0-beta (`--fast --runExternalCode`), `typescript` 7.1.0-beta, `vue` 3.5.44, Windows 11. `vize` 0.630.0 and 0.638.0 give the same result. Oracle: `vue-tsc` 3.3.14 with `typescript` 6.0.3, which reports no error for the same file.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": { "tsrs": "0.20.1-ts7.1.0-beta", "typescript": "7.1.0-beta", "vize": "0.644.0", "vue": "3.5.44" }
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
  "include": ["src/Probe.vue"]
}
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
defineEmits<{ e0: [value: number] }>();
defineModel<number>("m0");
defineModel<number>("m1");
defineModel<number>("m2");
defineModel<number>("m3");
defineModel<number>("m4");
defineModel<number>("m5");
defineModel<number>("m6");
defineModel<number>("m7");
defineModel<number>("m8");
defineModel<number>("m9");
defineModel<number>("m10");
defineModel<number>("m11");
defineModel<number>("m12");
defineModel<number>("m13");
defineModel<number>("m14");
defineModel<number>("m15");
</script>

<template>
  <div />
</template>
```

```sh
npm i && npx tsrs --fast --runExternalCode -p tsconfig.json
```

The oracle is a second project with `vue-tsc` 3.3.14, `typescript` 6.0.3 and `vue` 3.5.44, the same `src/Probe.vue`, and the same `tsconfig.json` without `contentMappers`:

```sh
npm i && npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error. The position is in generated code, which has no place in the source file:

```
src/Probe.vue(174,23): error TS2339: Property 'e0' does not exist on type '$StaticEventMap'.
  This location is in virtual code produced by the content mapper 'vize@0.644.0' and has no corresponding location in the original file.
```

The component declares one emit and 16 models, so 17 events. The earliest event, `e0`, is the one missing. With one model fewer, `tsrs` reports no error.

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const probeText: number = "a"; void probeText;` after `defineEmits` gives `TS2322` at the same line in both tools.

## Cause

The cause is likely that a component with models builds its event map from overloads, and the overload walk stops after 16 of them. The source is read at the tag `v0.638.0` of `ubugeeei-prod/vize`. A run confirmed the limit of the helper in plain TypeScript, and the components fail on 0.644.0 at the size the helper predicts.

`generator/emits.rs:310` declares the event map from `Emits`:

```rust
ts! { &mut *ts => type $StaticEventMap = __EmitOptions<Emits>; }
```

With models, `Emits` is, in the code that `vize check` saves, an intersection of two `__EmitFn<…>` types, which is a function type with one overload per event. `__EmitOptions` reads such a type through `$OverloadParameters`, which calls `$OverloadUnionRecursive`. That helper stops at a depth of 32 and uses two levels for each overload (`helpers/declarations/emit-overloads.d.ts.txt:2`):

```ts
type $OverloadUnionRecursive<TOverload, TPartialOverload = unknown, TDepth extends unknown[] = []> = TDepth['length'] extends 32 ? never : …
```

The walk starts from the last overload, so the first events are the ones lost. A component with keys and no models does not fail at any size tested, so its map is likely built from the keys. The code that the content mapper generates inside `tsrs` is not saved, so this path is read and not observed.

I confirmed this in plain TypeScript with the helper types copied from the binary. The same probe fails from 17 events with `tsrs` (with and without `--fast`), native TypeScript 7.0.2 and stock TypeScript 5.9.3, so the compiler is not the cause. With the depth set to 64, the 17-event and 22-event cases keep every event. At 32 events `tsrs` then stops the same recursion with `TS5114: Instantiations of type '$OverloadUnionRecursive' appear infinitely circular`. A higher limit alone does not fix this.

Building the map from the keyed object, as `__EmitOptions` does for a type that is not a function, keeps every event. The probe with 16, 17, 40 and 100 keys has no error. The fix is to build `$StaticEventMap` from the keyed event types and not from the overloaded function.

## Real occurrence

The shape in a real component: [`Menu/Index.vue` lines 230 to 256](https://github.com/Esposter/Esposter/blob/a92c7863855db4ea45ff1cefce698b6c7f9039b4/packages/genshin-world/src/components/World/Session/Menu/Index.vue#L230-L256) has the shape: `defineEmits` and `defineModel` together in one component.

## Isolation

One change at a time. Errors on `vize` 0.644.0 with `tsrs`, and `vue-tsc` on the first, third and last rows:

| Declared events            | `tsrs` |
| :------------------------- | -----: |
| 1 emit and 16 models (17)  |      1 |
| 1 emit and 15 models (16)  |      0 |
| 12 emits and 5 models (17) |      1 |
| 11 emits and 5 models (16) |      0 |
| 16 emits and 1 model (17)  |      1 |
| 24 emits and no model (24) |      0 |
| No emit and 17 models (17) |      0 |

`vue-tsc` reports no error for the files it ran. The last row has no declared emit, so nothing reads the events that the map lost, and the error does not appear.

## Not known

The same input with `typescript-native-bridge` 6.0.3 fails every file, including the 16-event one, with `TS18069: The content mapper process failed while handling the project request` on 0.638.0 and 0.644.0. That is a different failure and it is not analysed here. Releases older than 0.630.0 are not tested. The `defineEmits` call-signature form is not tested. The fix is read from the source and not applied.

## Not a duplicate of

Searched open and closed issues and pull requests in `ubugeeei-prod/vize` for `emit`, `emits`, `defineEmits`, `StaticEventMap`, `overload`, `does not exist on type`, `16` and `depth`. The search matches words, not meaning. `StaticEventMap` has no result. The nearest are #9429 (closed; a runtime array `defineEmits` gives `TS2339`, a different input), #9435 (merged; preserves component event contracts, and this limit still reproduces on 0.644.0), #11023 (open; prop overload selection for Vue constructors) and #10617 (closed; `$`-prefixed template globals typed any).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
