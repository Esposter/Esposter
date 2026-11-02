# content-mapper: a destructured parameter of a callback nested in an inline callback prop gets an implicit `any` (TS7031) in the inference-only copy

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

An inline callback prop with a block body that holds a second callback gives TS7031 when the second callback has a destructured parameter. `vue-tsc` accepts the same file. #11361 reported the same mechanism for a plain parameter, and #11380 fixed that case only.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Node 26.13.0, Linux x64. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which accepts the file.

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
  "include": ["src/**/*.vue"]
}
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
interface Foo {
  bar: (callback: (baz: { qux: number }) => void) => void;
}

function Child(props: { onQux?: (foo: Foo) => void }) {
  return null;
}
</script>

<template>
  <Child
    :on-qux="
      (foo) => {
        foo.bar(({ qux }) => {
          console.log(qux);
        });
      }
    "
  />
</template>
```

```sh
pnpm i && pnpm exec tsrs --runExternalCode --noEmit -p tsconfig.json
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

## Actual

The position is in the generated code:

```
src/Probe.vue(55,20): error TS7031: Binding element 'qux' implicitly has an 'any' type.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `qux.nope();` after `console.log(qux);` gives TS2339 on `nope` in both tools, at the same source position.

## Cause

The mapper writes each inline callback prop twice. The first copy only infers types and carries a one-line `@ts-ignore`. The generated code is (lines 52 to 60 of the generated file):

```ts
const __vize_resolved_Child_props_0 = (undefined as unknown as import("vize:virtual-ts").$ResolvedContextProps)(
  (undefined as unknown as import("vize:virtual-ts").$PropsResolver<typeof Child>)({
    // @ts-ignore Inference-only callback prop; mapped prop owner checks diagnostics.
    onQux: (foo) => {
      foo.bar(({ qux }) => {
        console.log(qux);
      });
    },
  }),
);
```

The `@ts-ignore` covers line 54 only. The error is on line 55, in the body of the same copy, where the parameter of the nested callback has no type.

The cause is the check in the rewrite that #11380 added for nested callbacks. `inference_callback_parameters_on_ignored_lines` (`crates/vize_canon/src/virtual_ts/expressions/ts_suppression_comments.rs:21-25`) calls `nested_callbacks::rewrite`. That function inserts `// @ts-ignore Inference-only nested callback parameter.` inside the parentheses, before the parameter. It skips every parameter that is not a plain identifier (`ts_suppression_comments/nested_callbacks.rs:67-69`):

```rust
let BindingPattern::BindingIdentifier(binding) = &parameter.pattern else {
    continue;
};
```

The function never reads `params.rest`, so a rest parameter gets no directive either.

I confirmed the cause on the saved generated file (`vize check --save-virtual-ts-for`). I compiled it with `tsrs` and no mapper: the error stays at (55,20). I then wrote the directive inside the parentheses, before `{ qux }`:

```ts
foo.bar((
// @ts-ignore Inference-only nested callback parameter.
{ qux }) => {
```

`tsrs` then reports no error.

The fix is likely to insert the directive before an object pattern, an array pattern and a rest parameter, as the code does for an identifier. The code is unchanged on `main` and in 0.651.0.

## Real occurrence

The shape in a real Nuxt app: [`Dungeons/World/Character/Index.vue` line 104](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Dungeons/World/Character/Index.vue#L104) has `.subscribe(({ direction: newDirection }) => {` in an inline `:on-complete` callback with a block body. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                             | `tsrs` | `vue-tsc` |
| :----------------------------------------------------------------- | -----: | --------: |
| None                                                               |      1 |         0 |
| Plain parameter: `(baz)`                                           |      0 |         0 |
| Renamed binding: `({ qux: quux })`                                 |      1 |         0 |
| Array pattern: `([qux])`, with `baz: [number]`                     |      1 |         0 |
| Rest parameter: `(...qux)`, with `...baz: number[]` (TS7019)       |      1 |         0 |
| Function expression: `function ({ qux }) { … }`                    |      1 |         0 |
| Expression body: `({ qux }) => console.log(qux)`                   |      1 |         0 |
| Annotated parameter: `({ qux }: { qux: number })`                  |      0 |         0 |
| Default value: `({ qux } = { qux: 1 })`                            |      0 |         0 |
| The whole outer callback on one line                               |      0 |         0 |
| The child is a `.vue` file with `defineProps` and the same `onQux` |      1 |         0 |

Errors with `vize` 0.638.0, 0.645.0 and 0.651.0 on the same file: 1 each. `vue-tsc` reports 0 in each. The input is not a regression.

## Not known

Versions before 0.638.0 are not tested for this input. The fix is confirmed on the generated file and not applied to the source of `vize`.

In the real component, four other nested callbacks have a destructured parameter in `filter(({ charId }) => …)` from `rxjs`. They do not report TS7031, and the reduction with `rxjs` shows the same: `pipe(filter(({ charId }) => …))` gives no error and `subscribe(({ … }) => …)` gives one. The reason is not known.

`vize check` reports no error for the same file. The diagnostic appears only through the content mapper.

## Not a duplicate of

Searched open and closed issues and pull requests for TS7031, TS7006, binding element, callbacks and inference. The search matches words, not meaning. The nearest are #11361 (closed; a plain parameter of a nested callback, fixed by #11380) and #10220 (closed; the parameters of the callback itself on a later line). The input of #11361 gives no diagnostic on 0.650.0. This report is the same mechanism for a parameter that is a pattern. #11374 (open) reports authored errors that the mapper copies report again. That differs: this input has no authored error.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
