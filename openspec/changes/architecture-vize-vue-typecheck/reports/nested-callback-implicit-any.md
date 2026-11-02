# content-mapper: a callback nested in an inline callback prop gets an implicit `any` (TS7006) in the inference-only copy

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

An inline callback prop with a block body that holds a second callback gives TS7006 on the second callback's parameter. `vue-tsc` accepts the same file.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.638.0",
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
  bar: (callback: (baz: number) => void) => void;
}

function Child(props: { onQux?: (foo: Foo) => void }) {
  return null;
}
</script>

<template>
  <Child
    :on-qux="
      (foo) => {
        foo.bar((baz) => console.log(baz));
      }
    "
  />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

The position is in the generated code:

```
src/Probe.vue(55,18): error TS7006: Parameter 'baz' implicitly has an 'any' type.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `foo.nope();` to the body gives TS2339 in both tools.

## Cause

The mapper writes each inline callback prop twice. The first copy only infers types and carries a one-line `@ts-ignore`. The generated code is:

```ts
const __vize_resolved_Child_props_0 = (undefined as unknown as import("vize:virtual-ts").$ResolvedContextProps)(
  (undefined as unknown as import("vize:virtual-ts").$PropsResolver<typeof Child>)({
    // @ts-ignore Inference-only callback prop; mapped prop owner checks diagnostics.
    onQux: (foo) => {
      foo.bar((baz) => console.log(baz));
    },
  }),
);
```

`@ts-ignore` covers only the next line, which is line 54. The error is on line 55, in the body of the same copy. The code that writes the comment knows this (`crates/vize_canon/src/virtual_ts/expressions/callback_prop_resolution.rs:181-183`):

```rust
// This copy is intentionally unmapped. `@ts-ignore` covers only the
// next line, so the parameter tokens have to sit on the property line
```

`callback_parameters_on_ignored_line_with_ranges` (`expressions/ts_suppression_comments.rs:39-48`) finds the first `=>`, joins the lines before it, and keeps the rest of the text as it is. So the parameters of the callback itself sit on the covered line, and the parameters of a callback nested in the body stay on a later line.

The fix is likely to cover every line of the inference-only copy, or to emit the copy without the body.

## Real occurrence

The shape in a real Nuxt app: [`Dungeons/World/Character/Index.vue` lines 44 to 85](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Dungeons/World/Character/Index.vue#L44-L85) has an inline `:on-complete` callback with a block body, and a `.subscribe((positionChange) => …)` callback in that body. `vue-tsc` accepts it.

## Isolation

One change at a time. Errors on `vize` 0.638.0, `tsrs` and `vue-tsc`:

| Change                                                        | `tsrs` | `vue-tsc` |
| :------------------------------------------------------------ | -----: | --------: |
| None                                                          |      1 |         0 |
| Expression body on one line: `(foo) => foo.bar((baz) => baz)` |      0 |         0 |

## Not known

Versions before 0.638.0 are not tested for this input. The fix is read from the source and not applied.

## Not a duplicate of

Searched open and closed issues and pull requests for TS7006, callbacks and inference. The search matches words, not meaning. The nearest are #10191 (closed; a callback whose own parameters are on a later line, fixed by #10220) and #10879 (merged; event-inference callbacks stay out of unowned copies). The input of #10191 gives no diagnostic on 0.638.0. This report is the same mechanism for the parameters of a nested callback.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
