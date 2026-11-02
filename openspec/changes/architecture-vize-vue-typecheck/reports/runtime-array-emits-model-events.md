# content-mapper: a runtime `defineEmits` with a `defineModel` leaves the model's event out of the event map (TS2339)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A component whose `defineEmits` takes an array or an object, and which also calls `defineModel`, gets one `TS2339` for each model: the model's `update:` event is missing from `$StaticEventMap`. `vue-tsc` accepts the same file.

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
defineEmits(["a0", "a1", "a2"]);
defineModel<number>("m0");
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
src/Probe.vue(76,57): error TS2339: Property 'update:m0' does not exist on type '$StaticEventMap'.
  This location is in virtual code produced by the content mapper 'vize@0.644.0' and has no corresponding location in the original file.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const probeText: number = "a"; void probeText;` after `defineModel` gives `TS2322` at that line.

## Cause

The cause is that the generated code reads the model's event from a map that was built without it. The mapper writes these lines for the reproduction (taken from `generateVueLanguageCode` of `@vizejs/native` 0.644.0, shortened):

```ts
export type Emits = Awaited<ReturnType<typeof __setup>>["__vize_emits"] &
  ((event: "update:m0", value: number | undefined) => void);
type $AuthoredEventMap = $StaticEventMap & {
  a0: $StaticEventMap["a0"];
  /* __vize_model_event */ "update:m0": $StaticEventMap["update:m0"];
};
type $StaticEventMap = __EmitOptions<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
type $StaticEmitProps = __EmitProps<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
```

`Emits` holds the model's event, and `$AuthoredEventMap` reads it from `$StaticEventMap`. But `$StaticEventMap` is built from `__vize_emits` alone, which is the array's events. The two lines are `generator/emits.rs:300` and `generator/emits.rs:304` at the tag `v0.638.0` of `ubugeeei-prod/vize`:

```rust
type $StaticEventMap = __EmitOptions<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
type $StaticEmitProps = #emit_props<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
```

`$StaticEmitProps` is built the same way, so the handler props `onUpdate:m0` of the component are missing as well (read in the source, not observed in a component). The change that fixes it is to build both from `Emits`, which already holds the model events. The typed branch of the same function does that at lines 310 and 320.

### Proposed fix

Replace the argument of both lines with `Emits`:

```rust
type $StaticEventMap = __EmitOptions<Emits>;
type $StaticEmitProps = #emit_props<Emits>;
```

For a generic component, `Emits` takes the component's generic parameters, and the runtime branch sets `generic_event_map_decl` to an empty string. The typed branch passes them at line 315 (`Emits<#names>`). The same would be needed here. This is read in the source and not tested.

### Checks of the fix

The fix is tested by changing the two generated lines in a copy of the native module of `vize` 0.644.0, and running single-file components through the content mapper with `tsrs`. The copy also holds the fix for `event-map-overload-cap.md`, which a component with more than 16 events needs.

| Component                                                               | Current vize                  | With the fix |
| :---------------------------------------------------------------------- | :---------------------------- | :----------- |
| Array of 3 events and 1 model                                           | `TS2339` × 1                  | Clean        |
| Array of 6 events and 4 models                                          | `TS2339` × 4                  | Clean        |
| Array of 10 events and 10 models                                        | `TS2339` × 10                 | Clean        |
| Array of 20 events and 20 models                                        | `TS2339` × 20                 | Clean        |
| Object `defineEmits({ ... })` of 3 events and 2 models                  | `TS2339` × 2                  | Clean        |
| Array of 2 events, 2 models and an `emit('a0', 1)` call in the template | `TS2339` × 2                  | Clean        |
| Parent binds `@a0` and `@update:m0` with right payloads                 | `TS2339` × 2                  | Clean        |
| Parent binds `@update:m0` with a wrong payload                          | `TS2339` × 2 and `TS2322` × 1 | `TS2322` × 1 |
| Array of 6 events, no model                                             | Clean                         | Clean        |
| Array of 20 events, no model                                            | Clean                         | Clean        |
| Object of 2 events, no model                                            | Clean                         | Clean        |

Components with no model give the same output before and after, and the 26 other components of the same run, which use a type for `defineEmits`, give the same output apart from the cap fix.

## Real occurrence

https://github.com/orbat-mapper/orbat-mapper/blob/23b352d961a445b6670257be9255f2cc65d5280b/src/modules/grid/OrbatGrid.vue#L33

## Isolation

One change at a time from the reproduction, on `vize` 0.644.0 with `tsrs`. The count is the number of errors:

| Component                                                      | Errors |
| :------------------------------------------------------------- | -----: |
| Array of 3 events and 1 model                                  |      1 |
| Array of 6 events and 4 models                                 |      4 |
| Array of 10 events and 10 models                               |     10 |
| Array of 6 events, no model                                    |      0 |
| Array of 20 events, no model                                   |      0 |
| Object of 3 events and 2 models                                |      2 |
| Object of 2 events, no model                                   |      0 |
| Array of 2 events, 2 models and an `emit` call in the template |      2 |

There is one error for each model, and none without a model. The count of events does not matter.

## Not known

The fix is tested by changing the generated lines in a copy of the native module, and not in a build of vize. No Rust toolchain was available, so vize's own tests did not run on it. A generic component with a runtime `defineEmits` is not tested. Vue 2 mode is not tested. Releases older than 0.630.0 are not tested. The handler props `onUpdate:m0` of a component that uses the child are not observed.

## Not a duplicate of

Searched open and closed issues and pull requests in `ubugeeei-prod/vize` for `runtime array defineEmits defineModel StaticEventMap update`, with no result. The nearest is #9429 (closed): `defineEmits(['click'])` alone gave `TS2339` on `click`, which is fixed, and the same array without a model is clean on 0.644.0. This case needs a model. The event-map overload cap, in `event-map-overload-cap.md`, is a separate defect in the same map: it needs more than 16 events and loses the earliest, and this one fails at 4 events and loses the model's event.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
