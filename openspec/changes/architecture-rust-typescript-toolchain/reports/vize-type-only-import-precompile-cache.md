feat: persist the pre-compile result of a component whose type-only import no macro reads

### Problem

A component with any type-only import is never saved to the persistent pre-compile cache. It compiles again in every Vite environment of every build. This holds when no macro reads the import. The same component without the import is restored from disk.

### Area

Vite plugin

### Version

`@vizejs/vite-plugin` 0.715.0 with `@vizejs/native` 0.715.0.

### Environment

- OS: Windows 10 Home 10.0.19045
- Node.js: v26.12.1
- Package manager: pnpm
- Vite 8.3.6, Vue 3.5.45, TypeScript 6.0.3

### Minimal reproduction

Create these files in an empty directory.

`package.json`:

```json
{
  "type": "module",
  "scripts": { "build": "vite build" },
  "dependencies": { "vue": "3.5.45" },
  "devDependencies": { "vite": "8.3.6", "typescript": "6.0.3", "@vizejs/vite-plugin": "0.715.0" }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`vite.config.ts`:

```ts
import vize from "@vizejs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [vize()] });
```

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>repro</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/main.ts`:

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

`src/App.vue`:

```vue
<script setup lang="ts">
import Foo from "./Foo.vue";
import Bar from "./Bar.vue";
</script>

<template>
  <Foo />
  <Bar />
</template>
```

`src/Foo.vue`:

```vue
<script setup lang="ts">
const label = "foo";
</script>

<template><p>{{ label }}</p></template>
```

`src/Bar.vue`:

```vue
<script setup lang="ts">
import type { Ref } from "vue";
const label = "bar";
</script>

<template><p>{{ label }}</p></template>
```

Run the build twice in a row:

```text
pnpm install
pnpm build
pnpm build
```

### Actual

Build 1:

```text
[vize] Pre-compilation complete: 3 recompiled, 0 restored from disk, 0 reused, 0 failed (17.93ms, native batch: 3.45ms)
```

Build 2:

```text
[vize] Pre-compilation complete: 1 recompiled, 2 restored from disk, 0 reused, 0 failed (16.05ms, native batch: 3.39ms)
```

The index of the `.vpc` file in `node_modules/.vize/vite-precompile` lists `src/App.vue` and `src/Foo.vue`. It does not list `src/Bar.vue`. The type `Ref` is never used.

Delete the `import type` line from `src/Bar.vue` and delete `node_modules/.vize`. Build twice again. Build 2 then reports `0 recompiled, 3 restored from disk`, and the index lists all three files.

### Proposal

Do not capture a TypeScript project for a type-only import that no macro type reads. Then the component persists, as the same component without the import does. A type-only import that a macro type reads keeps the project, and keeps the exclusion that the project needs.

### Cause

Likely. The source was read at the tag `v0.715.0` (commit `584b15faa65eeead8699ae1d4e972fcec78852d4`) and was not changed.

The cache refuses a module that has a `typeProject`. `npm/builder/vite/src/plugin/precompile-cache-store.ts:60-64`:

```ts
export function isPersistablePrecompileModule(module: CompiledModule): boolean {
  return module.typeProject === undefined && (!module.dependencies || module.dependencies.length === 0);
}
```

The native compiler gives a module a `typeProject` when this function returns true. `crates/vize_atelier_sfc/src/script/context/external_types/resolution/project.rs:75-90`:

```rust
pub fn is_needed_by(descriptor: &crate::types::SfcDescriptor<'_>) -> bool {
    if descriptor.script_setup.is_none() {
        return false;
    }
    [descriptor.script.as_ref(), descriptor.script_setup.as_ref()]
        .into_iter()
        .flatten()
        .any(|script| {
            if !matches!(script.lang.as_deref(), Some("ts" | "tsx")) {
                return false;
            }
            let mut summary = super::super::FileTypeSummary::default();
            super::super::extract_script_summary(&script.content, &mut summary, false);
            !summary.specifiers.is_empty()
        })
}
```

The summary collects one specifier for each type-only import, in a whole declaration or in one specifier. `crates/vize_atelier_sfc/src/script/context/external_types.rs:182-202`:

```rust
let type_import = import_decl.import_kind.is_type()
    || is_import_type_only(import_decl, source)
    || import_decl.specifiers.as_ref().is_some_and(|specifiers| {
        specifiers.iter().any(|specifier| match specifier {
            ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                spec.import_kind.is_type()
            }
            _ => false,
        })
    });
let declaration_value_import = follows_value_imports
    && import_decl
        .specifiers
        .as_ref()
        .is_some_and(|specifiers| !specifiers.is_empty());
if !type_import && !declaration_value_import {
    continue;
}
summary
    .specifiers
    .push(import_decl.source.value.to_compact_string());
```

The check does not read whether a macro uses the import. The runs in the isolation table agree: an unused type-only import has the same result as a used one.

### Real occurrence

https://github.com/Esposter/Esposter/blob/5f30b7c2b1de7cf243f0dfda63c829357abbe1c3/apps/web/app/components/App/Breadcrumbs.vue#L2

### Isolation

One component per row in the same project, with the plugin at 0.715.0. The result is whether the component is in the persisted index after a build.

| Component script                                                  | Persisted |
| :---------------------------------------------------------------- | :-------- |
| No import                                                         | yes       |
| `import { ref } from "vue"` and a use of `ref`                    | yes       |
| A local `interface Props` and `defineProps<Props>()`              | yes       |
| `defineProps<{ label: string }>()`                                | yes       |
| `import type { Ref } from "vue"`, used in a type annotation       | no        |
| `import type { Ref } from "vue"`, never used                      | no        |
| `import { type Ref } from "vue"`, used in a type annotation       | no        |
| `import type { Shape } from "./shape"`, used in a type annotation | no        |

### Alternatives considered

No option fixes it. The options read in the plugin's types are `typeResolutionFallbackTsconfig` and `typeChecker.tsconfig`. The first applies only when no tsconfig is found, and the reproduction has one. The second is not passed to the compiler. No documented option controls the cache exclusion or the project capture.

### Compatibility and rollout

The change narrows when a project is captured. A component whose macro types read an imported type behaves as before. The cache format does not change.

### Not known

- Whether the exclusion is wanted for a type-only import that no macro reads. A merged pull request states that cache records exclude project contexts on purpose. This request asks only to narrow when a project is captured.
- The cost in plain Vite. The reproduction shows the missing restore, and it does not measure time.
- The versions 0.713.0 and 0.714.0 write the same files and restore none, so the gap shows only from 0.715.0, where restore works.
- The fix was read and was not applied.

### Not a duplicate of

- #12152 and #12153 (closed): the cache restored nothing on Windows and across cache identities. Pull request #12156 fixed both in 0.715.0. Here the restore works for every component without a type-only import.
- Pull request #11865 (merged): it resolves imported props through the project configuration and states that cache records exclude the project contexts. This request asks to narrow when that project is captured.
- #3363 (closed): the cost of pre-compilation and the manifest size. No comment covers projects or type-only imports.
- #2828 and pull request #2840: the in-memory epochs of the imported-type cache, not the persistent cache.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
