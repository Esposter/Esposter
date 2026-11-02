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

The same helper reads `Emits` in more places than `$StaticEventMap`. `__EmitProps` is defined on `__EmitOptions<T>`, so the handler props of a component come from the same walk (read in the source, not observed in a component). The change that fixes it is to build the union of overloads with an accumulator, so that the recursion is in tail position and the depth limit is no longer reached at 16 events. A second idea is to pass a keyed type to the helpers. The fix is tested below, and the idea is tested only in part.

### Proposed fix

The smaller fix changes one line of `helpers/declarations/emit-overloads.d.ts.txt`. `$OverloadUnionRecursive` builds its union on the way out of the recursion, so the conditional type is not in tail position and the compiler stops it at about 30 levels. A form with an accumulator builds the union on the way in. The compiler evaluates a conditional type in tail position for up to 1000 iterations. The result is the same union, and the walk is cheaper. Every other line stays as it is:

```ts
type $OverloadUnionRecursive<
  TOverload,
  TPartialOverload = unknown,
  TDepth extends unknown[] = [],
  TAccumulated = never,
> = TDepth["length"] extends 900
  ? TAccumulated
  : TOverload extends (...args: infer TArgs) => infer TReturn
    ? TPartialOverload extends TOverload
      ? TAccumulated
      : $OverloadUnionRecursive<
          TPartialOverload & TOverload,
          TPartialOverload & ((...args: TArgs) => TReturn) & $OverloadProps<TOverload>,
          [...TDepth, unknown],
          TAccumulated | ((...args: TArgs) => TReturn)
        >
    : TAccumulated;
```

A second idea passes a keyed type, and not the overloaded function, to `__EmitOptions` and `__EmitProps`. The generator passes `Emits` to them at eight lines in four files: `generator/emits.rs` (85, 310, 315 and 320), `generator/component_constructors.rs` (156 and 182), `generator/component_constructors/emission.rs` (91) and `generator/setup_props.rs` (292). A keyed type needs no walk, so its cost is the lowest, and each of the eight lines would change. A first form for the model branch is `__EmitOptions<__EmitShape<Inner> & Models>`, where `Inner` is the authored events and `Models` is the `update:` events. It equals the current output by strict type identity for 11 of the 15 shapes below. It differs for a string-typed event, for literal events followed by a string fallback, for `Record<string, any[]>` and for a model that shares a name with an authored event, and in those four the two outputs are not assignable to each other. It is an idea that needs those four cases decided, and not a tested fix.

### Checks of the fix

All checks run in plain TypeScript. They use the helper text of the tag `v0.638.0`, once as it is and once with the fix, on TypeScript 5.9.3 and on `tsrs` 0.20.1-ts7.1.0-beta, with and without `--fast`. Vize's own test suite did not run (see "Not known").

| Check                                                                                 | Result                                                        |
| :------------------------------------------------------------------------------------ | :------------------------------------------------------------ |
| 15 emit shapes, 3 outputs each (45 comparisons), strict type identity, current vs fix | All identical                                                 |
| Negative control: the same comparison with a changed payload                          | Fails with `TS2344` on both tools, so the comparison can fail |
| Events held by the current helper, model branch                                       | 16 held, 17 and above fail                                    |
| Events held by the fix, model branch                                                  | Every event at 17, 22, 32, 40, 100, 200 and 400               |

The 15 shapes are the model branch with authored events, with models only and with models that share a name; call signatures; a single function type; a string event; literal events followed by a string fallback; a union event; an optional argument; a rest argument; a function with properties; no events; kebab-case events; labelled tuples; and generic payloads. The three outputs are the union of parameter tuples, the flattened `__EmitOptions` map and the flattened `__EmitProps` map.

Cost on TypeScript 5.9.3, from `--extendedDiagnostics`, for the model branch:

| Events | Current helper | Fix, instantiations | Fix, check time | Keyed type alone, instantiations |
| -----: | -------------: | ------------------: | --------------: | -------------------------------: |
|     16 |          9,689 |               7,078 |          0.08 s |                              176 |
|     22 |          fails |              11,479 |          0.11 s |                                - |
|     40 |          fails |              30,946 |          0.25 s |                              368 |
|    100 |          fails |             163,696 |          1.65 s |                              848 |
|    400 |          fails |           2,393,446 |            95 s |                            3,248 |

On `tsrs --fast` the fix takes 0.3 s at 16 events, as the current helper does, 0.6 s at 100 events and 20 s at 400 events. The keyed type takes 0.3 s at every size. The fix costs more as the count grows, and the keyed type does not. A component with 100 events is far past any real use, and the current helper drops events silently from 17.

## Real occurrence

https://github.com/Esposter/Esposter/blob/a92c7863855db4ea45ff1cefce698b6c7f9039b4/packages/genshin-world/src/components/World/Session/Menu/Index.vue#L230

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

The same input with `typescript-native-bridge` 6.0.3 fails every file, including the 16-event one, with `TS18069: The content mapper process failed while handling the project request` on 0.638.0 and 0.644.0. That is a different failure and it is not analysed here. Releases older than 0.630.0 are not tested. The `defineEmits` call-signature form is tested only as a type in the 15 shapes, and not in a component. The fix is not applied to a build of vize, because no Rust toolchain was available, so vize's own tests did not run on it. Vue 2 mode, `emit-inference` and the `__vize_emits` runtime-array path are not tested. The handler props of a component are compared as types, and are not observed in a component that uses the child.

## Not a duplicate of

Searched open and closed issues and pull requests in `ubugeeei-prod/vize` for `emit`, `emits`, `defineEmits`, `StaticEventMap`, `overload`, `does not exist on type`, `16` and `depth`. The search matches words, not meaning. `StaticEventMap` has no result. The nearest are #9429 (closed; a runtime array `defineEmits` gives `TS2339`, a different input), #9435 (merged; preserves component event contracts, and this limit still reproduces on 0.644.0), #11023 (open; prop overload selection for Vue constructors) and #10617 (closed; `$`-prefixed template globals typed any).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
