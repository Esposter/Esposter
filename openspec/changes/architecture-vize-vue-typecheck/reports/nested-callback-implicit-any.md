# content-mapper: TS7006 for a callback nested in an inline callback prop, in unmapped virtual code

A template passes an inline callback to a component prop. The body of the callback calls a function with a second callback that has an untyped parameter. `tsrs --runExternalCode` reports TS7006 for that parameter, at a position in generated code. `vue-tsc` reports nothing.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. A game component of the app passes `:on-complete` callbacks to a component. The body subscribes to an event stream with `.subscribe((movement) => …)`. Several such parameters give TS7006 or TS7031.

## Environment

`vize` 0.631.0, `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, Node 26, Windows 10. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsrs --runExternalCode --noEmit -p tsconfig.json",
    "typecheck:oracle": "vue-tsc --noEmit -p tsconfig.json"
  },
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.631.0",
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

`src/Reduced.vue`:

```vue
<script setup lang="ts">
interface Scene {
  run: (callback: (value: number) => void) => void;
}

function Child(props: { onComplete?: (scene: Scene) => void }) {
  return null;
}
</script>

<template>
  <Child
    :on-complete="
      (scene) => {
        scene.run((value) => console.log(value));
      }
    "
  />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives one error for the file. The position is in generated code. The file has fewer lines than the number in the message.

```
src/Reduced.vue(56,20): error TS7006: Parameter 'value' implicitly has an 'any' type.
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. The parameter `scene` has the type `Scene`, so `value` has the contextual type `number`.

```
No output. The command exits 0.
```

`vue-tsc` checks the file. In the last row, a read of a field that does not exist is an error in both checkers.

## Isolation

One change at a time from `Reduced.vue`. A row for the control counts only TS2339 errors.

| Change                                                                             | `tsrs` errors | `vue-tsc` errors |
| :--------------------------------------------------------------------------------- | ------------: | ---------------: |
| None (the callback is spread over several lines)                                   |             1 |                0 |
| The callback written on one line                                                   |             0 |                0 |
| The inner parameter has a type: `(value: number)`                                  |             0 |                0 |
| The callback is a typed `const` in the script                                      |             0 |                0 |
| The component is a `.vue` file imported from another file                          |             1 |                0 |
| A plain `.ts` file: the receiver of the inner callback is `any`                    |             1 |                1 |
| Control: the same file with a read of a field that does not exist (`scene.nope()`) |             1 |                1 |

`vize` 0.631.0 is the only version tested.

## Not known

The generated code from `vize check --show-virtual-ts` holds the callback twice. The first copy is inside a call to a props resolver, after the comment `// @ts-ignore Inference-only callback prop; mapped prop owner checks diagnostics.`. The comment covers only the next line. The resolver in that call falls back to a function that takes `any` when it cannot read the component's props. In that copy, `scene` is likely `any`, so the nested parameter has no contextual type. This fits the rows: a plain `.ts` file with an `any` receiver gives the same TS7006 in both checkers. It is not confirmed that `tsrs --runExternalCode` uses the same text.

## Not a duplicate of

Searched open and closed issues and pull requests for TS7006, callbacks and inference. The search matches words, not meaning. The nearest are #10191 (closed; a callback prop whose parameters are not on the first line, with the same one-line `@ts-ignore`), #10739 (closed) and #10879 (merged, and in 0.630.0 and 0.631.0; event-inference callbacks are kept out of the mapper's unowned copies). The input here is a bound callback prop whose body holds a second callback. It reproduces on 0.631.0.
