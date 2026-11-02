# content-mapper: a runtime `defineEmits` with a `defineModel` leaves the model's event out of the event map (TS2339)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

This is one of a batch of 2 issues filed together, all from that attempt, so they can be tracked as one set:

- #11390
- #11391 <-- you are here

An earlier batch from the same attempt is #11359 to #11368.

A component whose `defineEmits` takes an array or an object, and which also calls `defineModel`, gets one `TS2339` for each model: the model's `update:` event is missing from `$StaticEventMap`. `vue-tsc` accepts the same file.

## Environment

`vize` 0.645.0, `tsrs` 0.20.1-ts7.1.0-beta (`--fast --runExternalCode`), `typescript` 7.1.0-beta, `vue` 3.5.44, Windows 11. The result is the same on `vize` 0.644.0, 0.638.0, 0.630.0 and 0.550.0. On 0.463.0 the array form fails even without a model (#9429, since fixed), so the model case cannot be told apart there. Oracle: `vue-tsc` 3.3.14 with `typescript` 6.0.3, which reports no error for the same file.

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
defineEmits(["a"]);
defineModel();
</script>
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
src/Probe.vue(51,65): error TS2339: Property 'update:modelValue' does not exist on type '$StaticEventMap'.
  This location is in virtual code produced by the content mapper 'vize@0.645.0' and has no corresponding location in the original file.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const probeText: number = "a"; void probeText;` after `defineModel()` gives `TS2322` at line 4.

## Cause

The cause is that the generated code reads the model's event from a map that was built without it. A run confirms it: changing the two lines below clears every case in "Checks of the fix". The mapper writes these lines for the reproduction (from `generateVueLanguageCode` of `@vizejs/native` 0.645.0, shortened):

```ts
export type Emits = Awaited<ReturnType<typeof __setup>>["__vize_emits"] &
  ((event: "update:modelValue", value: unknown) => void);
type $AuthoredEventMap = $StaticEventMap & {
  a: $StaticEventMap["a"];
  /* __vize_model_event */ "update:modelValue": $StaticEventMap["update:modelValue"];
};
type $StaticEventMap = __EmitOptions<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
type $StaticEmitProps = __EmitProps<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
```

`Emits` holds the model's event, and `$AuthoredEventMap` reads it from `$StaticEventMap`. But `$StaticEventMap` is built from `__vize_emits` alone, which is the array's events. The two lines are `generator/emits.rs:300` and `generator/emits.rs:304` at the tag `v0.645.0` of `ubugeeei-prod/vize`, and they are the same at `v0.638.0`:

```rust
type $StaticEventMap = __EmitOptions<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
type $StaticEmitProps = #emit_props<Awaited<ReturnType<typeof __setup>>["__vize_emits"]>;
```

`$StaticEmitProps` is built the same way, so the handler props of the component lack `onUpdate:modelValue` as well. The typed branch of the same function passes `Emits` to both helpers, at lines 310 and 320.

### Proposed fix

Build both from `Emits`, which already holds the model events:

```rust
type $StaticEventMap = __EmitOptions<Emits>;
type $StaticEmitProps = #emit_props<Emits>;
```

This is the form the typed branch uses, so the two branches agree. A different fix would build a keyed type of the model events and join it to the map of `__vize_emits`. It needs no overload walk. It is not tested.

`Emits` reaches the overload walk in this branch, because it is an intersection of function types. A component with more than 16 runtime and model events then needs the fix of #11390 as well. Without it, this change fixes components of 16 events or fewer.

### Checks of the fix

The fix is tested by changing the two generated lines in a copy of the native module of `vize` 0.644.0, and running single-file components through the content mapper with `tsrs`. The copy also holds the fix of the other issue in the batch. The source of 0.645.0 is the same at those lines.

| Component                                                                    | Current vize                  | With the fix |
| :--------------------------------------------------------------------------- | :---------------------------- | :----------- |
| Array of 3 events and 1 model                                                | `TS2339` × 1                  | Clean        |
| Array of 6 events and 4 models                                               | `TS2339` × 4                  | Clean        |
| Array of 10 events and 10 models                                             | `TS2339` × 10                 | Clean        |
| Array of 20 events and 20 models                                             | `TS2339` × 20                 | Clean        |
| Object `defineEmits({ ... })` of 3 events and 2 models                       | `TS2339` × 2                  | Clean        |
| Array of 2 events, 2 models and an `emit('a0', 1)` call in the template      | `TS2339` × 2                  | Clean        |
| Parent binds `@a0` and `@update:m0` with right payloads                      | `TS2339` × 2                  | Clean        |
| Parent binds `@update:m0` with a wrong payload                               | `TS2339` × 2 and `TS2322` × 1 | `TS2322` × 1 |
| Generic component, `generic="T"`, array of 2 events and a model of type `T`  | `TS2339` × 1                  | Clean        |
| Generic component, `generic="T"`, object of 2 events and a model of type `T` | `TS2339` × 1                  | Clean        |
| Array of 6 events, no model                                                  | Clean                         | Clean        |
| Array of 20 events, no model                                                 | Clean                         | Clean        |
| Object of 2 events, no model                                                 | Clean                         | Clean        |

In the run of 34 components, the 8 with a runtime `defineEmits` and a model lose the false `TS2339`, and the 3 with no model give the same output. The 23 that use a type for `defineEmits` give the same output, apart from the fix of the other issue.

## Real occurrence

https://github.com/orbat-mapper/orbat-mapper/blob/23b352d961a445b6670257be9255f2cc65d5280b/src/modules/grid/OrbatGrid.vue#L33

## Isolation

One change at a time from the reproduction, on `vize` 0.645.0 with `tsrs`. The count is the number of errors:

| Component                        | Errors |
| :------------------------------- | -----: |
| Array of 1 event, default model  |      1 |
| Array of 3 events and 1 model    |      1 |
| Array of 6 events and 4 models   |      4 |
| Array of 10 events and 10 models |     10 |
| Array of 6 events, no model      |      0 |
| Array of 20 events, no model     |      0 |
| Object of 3 events and 2 models  |      2 |
| Object of 2 events, no model     |      0 |

There is one error for each model, and none without a model. The count of events does not matter.

## Not known

The fix is tested by changing the generated lines in a copy of the native module, and not in a build of vize. No Rust toolchain was available, so vize's own tests did not run on it. Vue 2 mode is not tested. Releases older than 0.463.0 are not tested. The keyed fix named above is not tested. A runtime component with more than 16 events needs the other fix of the batch, as written in "Proposed fix".

## Not a duplicate of

Searched open and closed issues and pull requests in `ubugeeei-prod/vize` for `runtime array defineEmits defineModel`, `StaticEventMap`, `update:modelValue does not exist` and `EventMap TS2339 defineModel`, with no matching result. The nearest is #9429 (closed): `defineEmits(['click'])` alone gave `TS2339` on `click`, which is fixed, and the same array without a model is clean on 0.645.0. This case needs a model. From the same attempt, #11359 (open) is a `defineModel()` read of a model key from a type that lacks it, a different input and a different error. #11390 is a separate defect in the same map: it needs more than 16 events and loses the earliest, and this one fails at 2 events and loses the model's event.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
