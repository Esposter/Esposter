build: `virtual-ts-emits.d.ts` imports a name that `virtual-ts.d.ts` exports only implicitly, so a declaration bundler fails with MISSING_EXPORT

## Summary

A declaration build fails with `MISSING_EXPORT` under vize 0.692.0 when a reachable component declares emits. `virtual-ts-emits.d.ts` imports `$ConstructorEmitPropsFactory` by name from `virtual-ts.d.ts`. `virtual-ts.d.ts` declares that type without `export`. TypeScript and rollup-plugin-dts accept the import, and rolldown-plugin-dts refuses it. vize 0.691.0 and 0.690.0 build the same project.

## Context

**Since the first batch: a production build of a Nuxt app with `@vizejs/nuxt` 0.692.0 compiles 956 components with none failing. `new` on an imported binding runs in the client (#11915). Props types from a private package resolve (#11918). The server HTML of four of five routes matches Vue's compiler (#11920, #11921). Thank you.**

I am moving the Vue tooling of a Nuxt monorepo to vize, in three steps:

1. Type check: `vue-tsc` becomes `tsrs` running the vize content mapper.
2. Library builds: `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins.
3. App build: Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue is from step 2. The library builds emit declarations with `tsrs` and the content mapper, and tsdown bundles them. It is the only issue filed from this batch.

## Environment

- `vize` 0.692.0 and `@vizejs/unplugin` 0.692.0. Both 0.691.0 and 0.690.0 build the same project.
- `tsdown` 0.23.5 with `rolldown` 1.2.16 and `rolldown-plugin-dts` 0.29.0, the version tsdown 0.23.5 installs.
- `tsrs` 0.22.0-ts7.1.0-beta and `vue` 3.5.45.
- Source of truth: TypeScript 6.0.3 `tsc` and `rollup-plugin-dts` 6.5.1 with `rollup` 4.67.5 accept the two-file declaration input below.
- OS: Darwin 27.0.0, arm64.
- Node.js: 26.13.0
- Package manager: pnpm@12.18.0

## Reproduction

Files: `package.json`, `tsconfig.json`, `tsdown.config.ts`, `src/index.ts` and `src/Foo.vue`.

Run `pnpm install`, then `pnpm exec tsdown`. The command exits with code 1.

`package.json`:

```json
{
  "devDependencies": {
    "@vizejs/unplugin": "0.692.0",
    "tsdown": "0.23.5",
    "tsrs": "0.22.0-ts7.1.0-beta",
    "vize": "0.692.0",
    "vue": "3.5.45"
  }
}
```

`tsconfig.json`:

```json
{ "contentMappers": [{ "package": "vize", "extensions": [".vue"] }] }
```

`tsdown.config.ts`:

```ts
import Vize from "@vizejs/unplugin/rolldown";
import { defineConfig } from "tsdown";

export default defineConfig({ dts: { generator: "tsrs", tsrs: { runExternalCode: true } }, plugins: [Vize()] });
```

`src/index.ts`:

```ts
export { default as Foo } from "./Foo.vue";
```

`src/Foo.vue`:

```vue
<script setup>
defineEmits(["Bar"]);
</script>
```

The same files with `vize` and `@vizejs/unplugin` at 0.691.0 build and write `dist/index.d.mts`.

The same refusal occurs with no vize and no Vue. Use two declaration files.

`package.json`:

```json
{
  "type": "module",
  "devDependencies": {
    "rolldown": "1.2.16",
    "rolldown-plugin-dts": "0.29.0",
    "rollup": "4.67.5",
    "rollup-plugin-dts": "6.5.1",
    "typescript": "6.0.3"
  }
}
```

`a.d.ts`:

```ts
type X = string;
export type Y = X;
```

`b.d.ts`:

```ts
import type { X } from "./a.js";
export type Z = X;
```

`rolldown.config.mjs`:

```js
import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
  input: "b.d.ts",
  output: { dir: "dist-rolldown" },
  plugins: [dts({ emitDtsOnly: true })],
});
```

`rollup.config.mjs`:

```js
import { dts } from "rollup-plugin-dts";

export default { input: "b.d.ts", output: { file: "dist/rollup-bundle.d.ts", format: "es" }, plugins: [dts()] };
```

`tsconfig.check.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "module": "nodenext",
    "moduleResolution": "nodenext"
  },
  "files": ["a.d.ts", "b.d.ts"]
}
```

Run `pnpm install`, then `pnpm exec rolldown -c rolldown.config.mjs`, `pnpm exec rollup -c rollup.config.mjs` and `pnpm exec tsc -p tsconfig.check.json`.

## Actual

`pnpm exec tsdown` in the vize project:

```text
 ERROR  Error: Build failed with 1 error:

[MISSING_EXPORT] "$ConstructorEmitPropsFactory" is not exported by "node_modules/.pnpm/vize@0.692.0_vue@3.5.45/node_modules/vize/virtual-ts.d.ts".
   ╭─[ node_modules/.pnpm/vize@0.692.0_vue@3.5.45/node_modules/vize/virtual-ts-emits.d.ts:1:27 ]
   │
 1 │ import { IsAny as $IsAny, $ConstructorEmitPropsFactory, $EmitOwnedKeys, __EmitProps } from "./virtual-ts.js" with { "resolution-mode": "import" };
```

The position is in the bundler's rewritten view of the file. The published file writes the same import over several lines near its top.

The two-file project:

```text
$ pnpm exec rolldown -c rolldown.config.mjs
 ERROR  Build failed with 1 error:
[MISSING_EXPORT] "X" is not exported by "a.d.ts".
$ pnpm exec rollup -c rollup.config.mjs
created dist/rollup-bundle.d.ts
$ pnpm exec tsc -p tsconfig.check.json
(exit code 0)
```

`dist/rollup-bundle.d.ts` keeps `X` as a local type:

```ts
type X = string;

type Z = X;

export type { Z };
```

## Expected

The vize project builds and writes `dist/index.d.mts`, as 0.691.0 does. The two-file project builds in rolldown-plugin-dts, as it does in rollup-plugin-dts and as `tsc` accepts it.

## Cause

The cause is confirmed by a run. It was read at tag `v0.692.0`.

`virtual-ts.d.ts` has no export declaration (`export {}`, `export { … }`, `export *` or `export =`). TypeScript then treats every top-level declaration of a declaration file as exported. `npm/cli/virtual-ts.d.ts`, line 137:

```ts
type $ConstructorEmitPropsFactory<F, O extends PropertyKey> = <P, E>(
```

Version 0.692.0 adds `virtual-ts-emits.d.ts`, which imports that name. `npm/cli/virtual-ts-emits.d.ts`, lines 2 to 7:

```ts
import type { IsAny as $IsAny, $ConstructorEmitPropsFactory, $EmitOwnedKeys, __EmitProps } from "./virtual-ts.js" with {
  "resolution-mode": "import",
};
```

The generator writes that header. `npm/cli/scripts/emit-inference-exports.ts`, lines 102 and 103:

```ts
// The public entry deliberately retains its legacy implicit exports. Keep
// the new private names in a separate module with an explicit export boundary.
```

rolldown-plugin-dts reads each declaration file as an ES module, so an unexported name has no export to link.

The fix is to write `export` before `type $ConstructorEmitPropsFactory` in the three `virtual-ts` files. I applied that with `pnpm patch vize@0.692.0` and the vize project above built. TypeScript already treats the name as exported, so the declarations' type surface does not change.

`virtual-ts-slots.d.ts` has the same pattern for `$IsAny`, imported from `generated/content-mapper-types.d.ts`, which declares it without `export`. That import is not used in the bundled output, so it does not fail the build.

## Real occurrence

One component with emits, in a public package that builds with this setup:

https://github.com/Esposter/Esposter/blob/024e91c80ea867d113c4079f2428a724eeb13454/packages/genshin-interface/src/components/ArtifactPicker/Index.vue#L25

## Isolation

One change at a time from the reproduction. The first row is the reproduction with `vize` in `devDependencies`.

| Change                                                                 | Result         |
| :--------------------------------------------------------------------- | :------------- |
| none                                                                   | MISSING_EXPORT |
| remove `defineEmits` from `Foo.vue`                                    | builds         |
| `defineEmits<{ bar: [] }>()` in place of the array form                | MISSING_EXPORT |
| a component with emits that `src/index.ts` does not export             | builds         |
| a component with `defineProps` only                                    | builds         |
| `vize` in `dependencies` or `peerDependencies`                         | builds         |
| `skipLibCheck: false` or `verbatimModuleSyntax: false` in the tsconfig | MISSING_EXPORT |
| `vize` and `@vizejs/unplugin` at 0.691.0 or 0.690.0                    | builds         |

The error needs a reachable component with emits, and it needs `vize` to be a package the bundler inlines. `vize` in `dependencies` stays external, so the bundler never reads the file.

## Not known

- I did not find why the build needs `vue` installed. Without it the error does not appear.
- The rolldown-plugin-dts README lists "unexported top-level `declare` statements" as input it cannot bundle. The name here is a type alias in a module, and I did not find the README naming that case.
- tsdown's default declaration generator builds, and it writes a `dist/index.d.ts` with no component types, so it does not exercise this path.
- The 0.691.0 build prints five `IMPORT_IS_UNDEFINED` warnings for slot helpers used as `__vizeSlotTypes.*` members, for example `$NativeSlotsFactory`. They do not fail the build. I did not check whether the bundled output keeps those types.

## Not a duplicate of

- #11137 (closed): the mapper emitted slot helper names that `virtual-ts` did not declare at all. Here the name is declared and only its `export` is missing.
- #11630 (closed): a declaration references `import("vize/virtual-ts")`, which loads its globals into consumers. It explains why the bundler reaches these files. It does not cover a missing export.
- #11907 (closed): the helper ABI hash contract was stale. It concerns hashes, not exports.
- #11435 (closed): emit overloads before a generic overload were dropped. Its fix added `virtual-ts-emit-overloads.d.ts`. It does not concern exports.
- rolldown-plugin-dts #312 (closed): its own output became implicitly exported. This report is about its input.
- rolldown-plugin-dts #322 (closed, not planned): CommonJS `export =` declarations are outside its scope, and its maintainer suggested that the package ship ESM declarations. This report is filed here for that reason.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
