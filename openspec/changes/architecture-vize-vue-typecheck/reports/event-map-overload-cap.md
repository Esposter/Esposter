# content-mapper: a component with `defineModel` past sixteen events loses its earliest events from its event map (TS2339)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

This is one of a batch of 2 issues filed together, all from that attempt, so they can be tracked as one set:

- #11390 <-- you are here
- #11391

An earlier batch from the same attempt is #11359 to #11368.

A component whose `defineEmits` keys and `defineModel` calls total more than 16 events loses its earliest events from `$StaticEventMap`. `tsrs` reports `TS2339` for each lost event. `vue-tsc` accepts the same file. The lost events are also unchecked: a handler with the wrong payload gets the false `TS2339` and not the real type error.

## Environment

`vize` 0.645.0, `tsrs` 0.20.1-ts7.1.0-beta (`--fast --runExternalCode`), `typescript` 7.1.0-beta, `vue` 3.5.44, Windows 11. The result is the same on `vize` 0.644.0, 0.638.0, 0.630.0, 0.550.0 and 0.463.0. The last two name the map `__VizeStaticEventMap`. Oracle: `vue-tsc` 3.3.14 with `typescript` 6.0.3, which reports no error for the same file.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": { "tsrs": "0.20.1-ts7.1.0-beta", "typescript": "7.1.0-beta", "vize": "0.645.0", "vue": "3.5.44" }
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
  This location is in virtual code produced by the content mapper 'vize@0.645.0' and has no corresponding location in the original file.
```

The component declares one emit and 16 models, so 17 events. The earliest event, `e0`, is the one missing. With 15 models, `tsrs` reports no error. A parent that binds `@e0` with a wrong payload gets this `TS2339`, and does not get the real `TS2322`.

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const probeText: number = "a"; void probeText;` after `defineEmits` gives `TS2322` in both tools.

## Cause

The cause is that the event map of a component with models comes from an overload walk, and the walk stops after 16 overloads. Two runs confirm it. The same helper text fails from 17 events in plain TypeScript on stock TypeScript 5.9.3, native TypeScript 7.0.2 and `tsrs`, so the compiler is not the cause. The fix below clears every failing case. The source is quoted at the tag `v0.645.0` of `ubugeeei-prod/vize`, and the helper and `generator/emits.rs` are the same at `v0.638.0`.

For `defineEmits<T>()` with models, the generator writes `Emits` as `__EmitFn<T> & __EmitFn<{ "update:…": … }>` (`generator/emits.rs:194`). That is a function type with one overload per event. Line 310 builds the map from it:

```rust
ts! { &mut *ts => type $StaticEventMap = __EmitOptions<Emits>; }
```

`__EmitOptions` reads the overloads through `$OverloadParameters` and `$OverloadUnionRecursive`. That helper stops at depth 32 and spends two levels on each overload (`helpers/declarations/emit-overloads.d.ts.txt:2`):

```ts
type $OverloadUnionRecursive<TOverload, TPartialOverload = unknown, TDepth extends unknown[] = []> = TDepth['length'] extends 32 ? never : …
```

The walk starts from the last overload, so the earliest events are the ones lost. Without models, `Emits` is the authored object type and the map comes from its keys, so a component with 24 events and no model is clean. The handler props of a component read the same walk through `__EmitProps`. In the published package the helper is in `virtual-ts-globals.d.ts`. The mapper run through `tsrs` reads it from there, and changing that file changes the result.

With the depth set to 64, 17 and 22 events hold. At 32 events the compiler stops the recursion with `TS5114: Instantiations of type '$OverloadUnionRecursive' appear infinitely circular`. A higher limit alone does not fix this.

### Proposed fix

Build the union with an accumulator, so that the conditional type is in tail position. The compiler evaluates a tail-position conditional type for up to 1000 iterations. The result is the same union. Every other line of the file stays as it is:

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

The guard of 900 is a choice for the maintainers. The cost grows faster than linearly with the number of events (see the cost table). The largest component in a real run below has 100 events.

Two other fixes were tried. Raising the depth fails at 32 events, as shown above. A keyed type passed to `__EmitOptions` at the eight lines that pass `Emits` is cheaper still. A first form of it, `__EmitOptions<__EmitShape<Inner> & Models>`, differs from the current output in 4 of 15 shapes. They are a string-typed event, literal events followed by a string fallback, `Record<string, any[]>`, and a model that shares a name with an authored event. The accumulator keeps the output identical in every shape tested.

### Checks of the fix

The type-level checks run in plain TypeScript with the helper text of `v0.638.0`, once as it is and once with the fix, on TypeScript 5.9.3 and on `tsrs`, with and without `--fast`. The real-run checks run single-file components through the content mapper of `vize` 0.644.0 in two projects that differ in one file, the package's `virtual-ts-globals.d.ts`. The helper text of 0.645.0 is the same as that of 0.644.0. Vize's own test suite did not run (see "Not known").

| Check                                                                        | Result                                                                                           |
| :--------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| 15 emit shapes chosen by hand, 3 outputs each, strict type identity          | All identical                                                                                    |
| 300 emit shapes from a fixed random seed, 16 events or fewer, 3 outputs each | All identical on both tools                                                                      |
| Negative controls: a changed payload, and two different shapes compared      | Each fails with one error, so the comparisons can fail                                           |
| Events held, model branch, plain TypeScript                                  | The current helper holds 16. The fix holds every event up to 400                                 |
| 23 components with a typed `defineEmits`, through the real content mapper    | 14 get false `TS2339` errors now (1 to 84 each) and none with the fix. The other 9 are identical |
| A generic component, `generic="T"`, with 17 typed events                     | `TS2339` on `$StaticEventMap<T>` now, clean with the fix                                         |

The 14 components are 1 emit with 16 models, 12 and 5, 16 and 1, 6 and 16, 20 and 20, 50 and 50, call signatures with 8 models, parents that bind a handler to a lost event, an `emit` call with a wrong payload, and the declarations of the real component in "Real occurrence" (25 emits and 9 models, the imported types stubbed). Components with 16 events or fewer give the same output with both helpers, errors included. A parent that binds a handler with the wrong payload to a lost event gets the real `TS2322` with the fix. The real component gives the same result: 18 false `TS2339` now, and the real `TS2322` with the fix.

The random shapes are keyed events, call signatures and function types, each alone and intersected with 1 to 3 model events. They use literal, union and string event names, optional, rest and labelled arguments, object and generic payloads, and kebab-case names.

Cost on TypeScript 5.9.3, from `--extendedDiagnostics`, for the model branch:

| Events | Current helper | Fix, instantiations | Fix, check time |
| -----: | -------------: | ------------------: | --------------: |
|     16 |          9,689 |               7,078 |          0.08 s |
|     22 |          fails |              11,479 |          0.11 s |
|     40 |          fails |              30,946 |          0.25 s |
|    100 |          fails |             163,696 |          1.65 s |
|    400 |          fails |           2,393,446 |            95 s |

On `tsrs --fast` the fix takes 0.3 s at 16 events, as the current helper does, 0.6 s at 100 events and 20 s at 400 events. In the real run, check time did not change up to 40 events and went from 0.4 s to 0.7 s at 100 events. The current helper drops events silently from 17.

## Real occurrence

https://github.com/Esposter/Esposter/blob/a92c7863855db4ea45ff1cefce698b6c7f9039b4/packages/genshin-world/src/components/World/Session/Menu/Index.vue#L230

## Isolation

One change at a time from the reproduction. Errors on `vize` 0.644.0 with `tsrs`. The reproduction pins `vize` 0.645.0, and its helper text is the same as 0.644.0's (see "Checks of the fix"), but these counts were not re-run on 0.645.0:

| Declared events            | Errors |
| :------------------------- | -----: |
| 1 emit and 16 models (17)  |      1 |
| 1 emit and 15 models (16)  |      0 |
| 12 emits and 5 models (17) |      1 |
| 11 emits and 5 models (16) |      0 |
| 16 emits and 1 model (17)  |      1 |
| 24 emits and no model (24) |      0 |
| No emit and 17 models (17) |      0 |

The last row has no declared emit, so nothing reads the events that the map lost, and no error appears.

## Not known

The fix is tested through the helper text and the package's helper file, and not through a build of vize. No Rust toolchain was available, so vize's own tests, which may hold the helper text in a snapshot, did not run on it. The real component was tested with its imported types stubbed, and not in the repository's own type check. Vue 2 mode is not tested. Releases older than 0.463.0 are not tested. A component with a runtime `defineEmits` and a model has a different cause and is #11391. A runtime component with more than 16 events needs both fixes.

## Not a duplicate of

Searched open and closed issues and pull requests in `ubugeeei-prod/vize` for `StaticEventMap`, `OverloadUnionRecursive`, `emit`, `defineEmits`, `overload`, `does not exist on type`, `depth` and `sixteen`. The search matches words, not meaning, and none of them returned this defect. The nearest are #9429 (closed; a runtime array `defineEmits` gives `TS2339`, a different input), #9435 (merged; preserves component event contracts, and this limit still reproduces on 0.645.0), #11023 (open; prop overload selection for Vue constructors) and #10617 (closed; `$`-prefixed template globals typed any). From the same attempt, #11359 (open) is a `defineModel()` read of a model key from a type that lacks it, a different input and a different error.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
