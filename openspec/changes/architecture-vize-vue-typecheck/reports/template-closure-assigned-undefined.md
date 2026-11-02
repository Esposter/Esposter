# content-mapper: an assignment in an inline callback prop does not narrow in the inference-only copy, so a later read reports TS18048

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue comes from the first step, the type check, and is one of a few I ran into. A first run of this check on the app reported 103 diagnostics that `vue-tsc` does not report. The twelve issues of the first batch are closed, and a run on `vize` 0.652.0 reported 15. This issue explains some of those 15.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

An inline callback prop with a block body assigns a ref and reads the ref on the next line. The mapper reports TS18048 (`possibly 'undefined'`) on the read. `vue-tsc` accepts the same file.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux x64. Source of truth: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which accepts the file. On `vize` 0.652.0 and 0.653.0 (macOS on Apple silicon), the reproduction below gives the same diagnostics at the same positions. `vue-tsc` reports none.

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
import { ref } from "vue";

interface Foo {
  width: number;
}

const foo = ref<Foo | undefined>();

function Child(props: { onBar?: (baz: Foo) => void }) {
  return null;
}
</script>

<template>
  <Child
    :on-bar="
      (baz) => {
        foo = baz;
        console.log(foo.width);
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
src/Probe.vue(65,21): error TS18048: 'foo' is possibly 'undefined'.
```

## Expected

No diagnostic, as with `vue-tsc`. The assignment `foo = baz` narrows `foo` to `Foo`. `vue-tsc` reads the file: adding `console.log(foo.nope);` after the read gives TS2339 in both tools, at the same source position.

## Cause

The mapper writes each inline callback prop twice. The first copy only infers types and carries a one-line `@ts-ignore`. The generated code is (lines 50 and 61 to 68 of the generated file):

```ts
var foo: __U<__R_foo> = void 0 as any;
// …
const __vize_resolved_Child_props_0 = (undefined as unknown as import("vize:virtual-ts").$ResolvedContextProps)(
  (undefined as unknown as import("vize:virtual-ts").$PropsResolver<typeof Child>)({
    // @ts-ignore Inference-only callback prop; mapped prop owner checks diagnostics.
    onBar: (baz) => {
      foo = baz;
      console.log(foo.width);
    },
  }),
);
```

In this copy the parameter `baz` has no type. `$PropsResolver<typeof Child>` is `(props: any) => {}` for a component that has no `__vizeResolveProps` and is not a library generic export (`crates/vize_canon/src/virtual_ts/helpers/declarations/component-checks.d.ts.txt:30`). So `foo = baz` assigns a value of type `any`. An assignment of `any` does not narrow the declared type `Foo | undefined`, and the read on line 65 reports TS18048. The `@ts-ignore` covers line 63 only.

The mapped copy of the same callback (the `$ResolvedProp<…>` check below it) types `baz` as `Foo`, so it narrows and reports nothing. The first copy is written by `append_props_object` with `erase_callbacks` set to false (`crates/vize_canon/src/virtual_ts/expressions/callback_prop_resolution.rs:93-100`). The comment is written at lines 170-174:

```rust
} else if inline_callback {
    append!(
        *ts,
        "{expr_indent}  // @ts-ignore Inference-only callback prop; mapped prop owner checks diagnostics.\n"
    );
}
```

The cause is confirmed on the saved generated file (`vize check --save-virtual-ts-for`). I compiled it with `tsrs` and no mapper: the error stays at (65,21). Two edits to that file each remove it:

- Write `(baz: Foo) =>` in the first copy.
- Write `// @ts-ignore` before line 65.

The fix is likely to type the parameters of the first copy as the mapped copy does. Another option is to cover every line of the first copy. The code is unchanged in 0.653.0 and on `main`.

## Real occurrence

https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Dungeons/World/Character/Player.vue#L114

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                      | `tsrs` | `vue-tsc` |
| :---------------------------------------------------------- | -----: | --------: |
| None                                                        |      1 |         0 |
| Typed parameter: `(baz: Foo) =>`                            |      0 |         0 |
| Cast: `foo = baz as Foo`                                    |      0 |         0 |
| Typed value: `foo = { width: 1 }`                           |      0 |         0 |
| Setup variable `let foo: Foo \| undefined;` in place of ref |      1 |         0 |
| Read on the same line as the assignment, body on a new line |      1 |         0 |
| The whole callback on one line                              |      0 |         0 |
| Expression body: `(baz) => (foo = baz).width`               |      0 |         0 |
| The child is a `.vue` file with `defineProps` and `onBar`   |      1 |         0 |

Errors with `vize` 0.638.0, 0.645.0 and 0.651.0 on the same file: 1 each. `vue-tsc` reports 0 in each. The input is not a regression.

## Not known

Versions before 0.638.0 are not tested for this input. The fix is confirmed on the generated file and not applied to the source of `vize`.

With the extra line `console.log(foo.nope);`, `tsrs` reports TS2339 twice. One report is at the mapped position, as `vue-tsc` does. The other is at a position in the first copy that has no mapping. Only the first is expected. This may share a cause with #11374.

In the real app, one file reports this shape. Many other templates assign in an inline callback prop. I did not count which of them read the value again on a later line.

`vize check` reports no error for the same file. The diagnostic appears only through the content mapper.

## Not a duplicate of

Searched open and closed issues and pull requests for TS18048, narrowing, assignment, callbacks and inference-only copies. The search matches words, not meaning. The nearest are #11374 (open) and #11380 (closed). #11374 is about an authored error that the mapper copies report again, because one `@ts-ignore` covers one line. #11380 is about plain parameters of nested callbacks.

#11374 has a real error in the source and this input has none. #11380 gives the parameters of nested callbacks a directive and does not change the typing of the first copy. This report may share a root cause with #11374 and #11361: the first copy keeps the whole body, and one line of suppression covers it.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
