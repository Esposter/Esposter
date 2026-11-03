compiler: `defineProps<T>()` gets no `props` option when `T` is imported through a tsconfig `paths` alias or through `@/` outside a `src` folder

## Summary

`vize build` compiles `defineProps<Foo>()` with no `props` option when `Foo` is imported through a tsconfig `paths` alias. With a destructured call, it writes `props: { bar: {} }` and drops the declared type. `@vue/compiler-sfc` resolves the same import through tsconfig `paths` and writes the declared props. A relative import works in both tools.

## Context

I am moving the Vue tooling of a Nuxt monorepo to vize, in three steps:

1. Type check: `vue-tsc` becomes `tsrs` running the vize content mapper.
2. Library builds: `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins.
3. App build: Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue is from step 3.

**Thank you for the earlier fixes (#11455, #11592, #11593 and #11594).**

This issue is one of 3 filed together from this attempt:

- nuxt: a production build on the Nuxt 5 nightly writes bare `"vue"` imports into the client, so the page never hydrates
- nuxt 5: the dev stylesheet plugin imports `nitropack/runtime`, so the Nuxt 5 nightly logs NUXT_B9003, and the peer range stops at Nuxt 4
- compiler: `defineProps<T>()` gets no `props` option when `T` is imported through a tsconfig `paths` alias or through `@/` outside a `src` folder <-- you are here

## Area

Other (the compiler, reproduced with the CLI)

## Version

`vize` 0.676.0.

## Environment

- OS: Linux
- Architecture: x86_64
- Node.js: 26.13.0
- Package manager: pnpm@12.16.1
- Rust: not used. The reproduction runs the published npm binary `@vizejs/native-linux-x64-gnu` 0.676.0.
- Framework: none. `typescript` 6.0.3 and `vue` 3.5.44.
- Source of truth: `@vue/compiler-sfc` 3.5.44 with `registerTS`.

## Minimal reproduction

The project has five files. Run `pnpm i`.

`package.json`

```json
{
  "private": true,
  "type": "module",
  "dependencies": { "@vue/compiler-sfc": "3.5.44", "typescript": "6.0.3", "vize": "0.676.0", "vue": "3.5.44" }
}
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": { "@lib/*": ["./src/*"] }
  }
}
```

`src/models/FooProps.ts`

```ts
export interface FooProps {
  bar?: Record<string, unknown>;
}
```

`src/PathsStar.vue`

```vue
<script setup lang="ts">
import type { FooProps } from "@lib/models/FooProps";

const props = defineProps<FooProps>();
</script>

<template>
  <div v-bind="props" />
</template>
```

`compare.mjs`

```js
import { readFileSync } from "node:fs";
import { compileScript, parse, registerTS } from "@vue/compiler-sfc";
import ts from "typescript";

registerTS(() => ts);
const file = process.argv[2];
const { descriptor } = parse(readFileSync(file, "utf8"), { filename: file });
console.log(compileScript(descriptor, { id: "x" }).content);
```

Compile the component with vize, then with the source of truth:

```bash
pnpm exec vize build src/PathsStar.vue -o out
cat out/PathsStar.js
node compare.mjs src/PathsStar.vue
```

Control: change the import to `./models/FooProps`. Both tools write the `props` option.

## Actual

`vize build` writes no `props` option. The component forwards the `props` object to the `div`, and the object has no declared keys:

```js
export default {
  __name: "PathsStar",
  setup(__props) {
    const props = __props;
    return (_ctx, _cache) => {
      return (
        _openBlock(),
        _createElementBlock(
          "div",
          _normalizeProps(_guardReactiveProps(props)),
          null,
          16,
          /* FULL_PROPS */
        )
      );
    };
  },
};
```

With a destructured call, `const { bar } = defineProps<FooProps>();`, the output has the key but no type:

```js
  props: { bar: {} },
```

## Expected

The `props` option from the declared type, as the source of truth writes it. The source of truth output for the component above contains:

```js
  props: {
    bar: { type: Object, required: false }
  },
```

The source of truth reads the import. With the `paths` entry removed from `tsconfig.json`, it fails with `Failed to resolve import source "@lib/models/FooProps"`.

## Cause

Likely. I read the source and did not change it. The import resolver of the script compiler is `resolve_import_path_uncached` in `crates/vize_atelier_sfc/src/script/context/external_types/resolution.rs`, lines 119 to 130, at tag `v0.676.0`:

```rust
fn resolve_import_path_uncached(current_file: &Path, specifier: &str) -> Option<PathBuf> {
    if let Some(alias_path) = resolve_at_src_alias(current_file, specifier) {
        return Some(alias_path);
    }

    if specifier.starts_with('#') {
        return resolve_package_import(current_file, specifier);
    }

    if !specifier.starts_with('.') && !specifier.starts_with('/') {
        return resolve_bare_specifier(current_file, specifier);
    }
```

The function resolves four forms: `@/`, `#` imports, bare package names under `node_modules`, and relative paths. A search of `crates/vize_atelier_sfc/src/script` for `tsconfig`, `paths` and `compilerOptions` finds no match. An alias such as `@lib/models/FooProps` goes to `resolve_bare_specifier`, which looks for a package folder named `@lib` under `node_modules`. It finds none and returns `None`, so the type stays unknown.

The `@/` form is fixed to one layout (lines 345 to 353 of the same file):

```rust
pub(super) fn resolve_at_src_alias(current_file: &Path, specifier: &str) -> Option<PathBuf> {
    let rest = specifier.strip_prefix("@/")?;
    let src_dir = current_file
        .parent()?
        .ancestors()
        .find(|path| path.file_name().is_some_and(|name| name == "src"))?;

    resolve_candidate_path(src_dir.join(rest))
}
```

The function maps `@/` to the nearest parent folder named `src`. Nuxt 4 and Nuxt 5 map `@/` and `~/` to the `app` folder, so the function finds no `src` folder and returns `None`.

The one-sentence change is to read the `paths` and `baseUrl` entries of the `tsconfig.json` that applies to the file, and to try them before `resolve_bare_specifier`. The output for an unresolved type, `bar: {}` for a destructured call and no option for the other form, comes from code that I did not read.

## Real occurrence

https://github.com/esposter/esposter/blob/02613a3bb662fc51e1a7d655f49d2c301402bb76/apps/web/app/components/Clicker/Svg/Group.vue#L2

## Isolation

One change at a time from the reproduction. The tsconfig has `"@/*": ["./src/*", "./app/*"]` for the `@/` rows, and the folder `models` inside `app` holds a copy of `FooProps.ts`.

| Change from the reproduction                                        | `props` option from vize | `props` option from the source of truth |
| ------------------------------------------------------------------- | ------------------------ | --------------------------------------- |
| None: `@lib/models/FooProps`, component in `src/`                   | missing                  | present                                 |
| Relative import `./models/FooProps`                                 | present                  | present                                 |
| `@/models/FooProps`, component in `src/`                            | present                  | present                                 |
| `@/models/FooProps`, component in `app/`                            | missing                  | present                                 |
| Destructured call `const { bar } = defineProps<FooProps>()`, `@lib` | `bar: {}`                | `bar` with its type                     |
| Component compiled by `vize` 0.640.0, 0.657.0 and 0.662.0           | missing                  | present                                 |

The last row shows that this is not a regression. I ran the oldest three releases that I had installed, and all three write no option for the `@lib` case and write the option for the relative case.

## Not known

- Whether the `props` loss has a second cause besides the unresolved type. The resolver explains the isolation table, but I did not run a changed build.
- Which code writes `bar: {}` for the destructured call. I did not read it.
- Whether a `vize.config` option sets the alias. I read `vize.config.schema.json` at the tag and found `typeChecker.tsconfig` only, which names the type checker and not the compiler. I did not run the option.
- Whether the Vite plugin and the Nuxt module pass the alias to the compiler by another path. The reproduction uses the CLI. I saw the same loss in an app build with `@vizejs/nuxt`.

## Not a duplicate of

- #9864 (closed), type-aware lint resolves exports and slot props of a `.vue` module imported through `paths` to `any`. It is about the lint rules and the type checker. It is not about the `props` option that the compiler writes.
- #7206 (closed), type-aware lint resolves types imported through `paths` to `any`. It is about `vize lint`, and `vize check` was correct.
- #10608 (closed), `vize doctor` reports false positives for imported type-alias props. It is about the doctor diagnostics, not about the compiled output.
- #7193 (closed), component prop completion ignores `paths` inherited through `extends`. It is about the editor service.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
