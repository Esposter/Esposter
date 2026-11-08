vite-plugin: on Windows the transform hook compiles a component again when its id has backslashes, because the pre-compile caches it under a forward-slash path

## Summary

On Windows, the transform hook of `@vizejs/vite-plugin` compiles a component that the pre-compile already compiled. The cache lookup misses when the module id has backslashes, because the pre-compile stores the path with forward slashes. The same project on Linux has no such miss.

## Environment

- `@vizejs/vite-plugin` 0.713.0 (the latest on npm), with `@vizejs/native` 0.713.0
- `vite` 8.3.6, `vue` 3.5.45
- The runtime and the package manager are at the versions in the `engines` and `packageManager` fields below
- Failing: Windows 10 (10.0.19045)
- Source of truth: the same project on Ubuntu in WSL2 (Linux 6.18.54.1-microsoft-standard-WSL2), with the same versions

## Reproduction

`package.json`:

```json
{
  "name": "vize-cache-key-repro",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@12.18.0",
  "engines": { "node": "26.13.0" },
  "scripts": { "build": "vite build" },
  "dependencies": { "vue": "3.5.45" },
  "devDependencies": { "@vizejs/vite-plugin": "0.713.0", "vite": "8.3.6" }
}
```

`vite.config.ts`:

```ts
import vize from "@vizejs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [vize({ debug: true })] });
```

`index.html`:

```html
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

`main.ts`:

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

`App.vue`:

```vue
<script setup lang="ts">
import Child from "./Child.vue";
</script>

<template>
  <Child />
</template>
```

`Child.vue`:

```vue
<template>
  <p>child</p>
</template>
```

Run these commands in an empty directory that holds the six files:

```
pnpm install
pnpm exec vite build
```

## Actual

On Windows, the hook compiles `App.vue` again (the path is shortened to `<project>`):

```
vite v8.3.6 building client environment for production...
[vize] Pre-compiling 2 Vue files... (2 changed, 0 cached, 0 removed)
[vize] Pre-compilation complete: 2 recompiled, 0 restored from disk, 0 reused, 0 failed (13.31ms, native batch: 0.98ms)
[vize] transform: compiling <project>\App.vue
✓ built in 108ms
```

## Expected

On Linux, the hook finds both components in the cache and prints no `transform: compiling` line:

```
vite v8.3.6 building client environment for production...
[vize] Pre-compiling 2 Vue files... (2 changed, 0 cached, 0 removed)
[vize] Pre-compilation complete: 2 recompiled, 0 restored from disk, 0 reused, 0 failed (24.17ms, native batch: 10.10ms)
✓ built in 131ms
```

## Cause

The cause is the spelling of the cache key. The pre-compile lists the files with `tinyglobby` and `absolute: true`, which returns forward slashes on Windows (`C:/…/App.vue`). The hook reads the cache with the path of the module id, which has backslashes on Windows for the entry component (`C:\…\App.vue`).

[`precompile-run.ts#L86-L91`](https://github.com/ubugeeei-prod/vize/blob/03081892a4c5aee8de383e7c7864bcc65238e4da/npm/builder/vite/src/plugin/precompile-run.ts#L86-L91) at v0.713.0:

```ts
const files = await glob(state.scanPatterns!, {
  cwd: state.root,
  ignore: state.ignorePatterns,
  absolute: true,
  followSymbolicLinks: false,
});
```

[`sfc-module.ts#L159-L161`](https://github.com/ubugeeei-prod/vize/blob/03081892a4c5aee8de383e7c7864bcc65238e4da/npm/builder/vite/src/plugin/sfc-module.ts#L159-L161) at v0.713.0:

```ts
  let compiled = cache.get(realPath);
  if (compiled?.source !== code) {
    state.logger.log(`transform: compiling ${realPath}`);
```

A run confirms the cause. In an isolated patched copy of the plugin, the lookup `cache.get(realPath.replaceAll("\\", "/"))` removes the `transform: compiling` line on Windows. The change that fixes it is to normalize the path to forward slashes where the cache is read, for example with Vite's `normalizePath`.

The `code` that the hook receives is the same text as the file on disk, so the source text is not the trigger. A comparison of the two in a larger Nuxt application found them equal for every component that no earlier plugin rewrites. Only the key differs.

## Real occurrence

https://github.com/Esposter/Esposter/blob/a4d8f428a978129e9c55ba01630eacaab8a9dd80/apps/web/configuration/modules.ts#L38

## Isolation

A logging plugin that prints each id before the hook shows the trigger. In one Windows build, `App.vue?vue&vize` reaches the hook as `C:\…\App.vue?vue&vize`, and the hook compiles it again. `Child.vue?vue&vize` reaches the hook as `C:/…/Child.vue?vue&vize`, and the hook does not.

| Change from the reproduction                                      | Result                                                                             |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| None, on Windows                                                  | `App.vue` (backslash id) is compiled again. `Child.vue` (forward-slash id) is not. |
| The same project on Linux                                         | Both ids have forward slashes. Neither component is compiled again.                |
| Windows, with `cache.get(realPath.replaceAll("\\", "/"))` patched | Neither component is compiled again.                                               |
| Windows, `@vizejs/vite-plugin` 0.702.0 and 0.680.0                | The same as 0.713.0.                                                               |
| Windows, `@vizejs/vite-plugin` 0.652.0 and 0.637.0                | `App.vue` has the backslash id. No `transform: compiling` line is printed.         |

## Not known

- The source of the backslash id is not traced to a line. In the reproduction, the id of `./App.vue` (imported from `main.ts`) has backslashes, and the id of `./Child.vue` (imported from `App.vue`) has forward slashes.
- Versions 0.652.0 and 0.637.0 print no `transform: compiling` line for the backslash id. Whether they compile the component again is not known.
- The reproduction has two files, so its cost is small. In a Nuxt application with many components, every component id reaches the hook with backslashes on Windows, and nearly every component is compiled again. The client build there spends most of its time in the transform hook. The Linux build of the same application spends almost none. The two builds ran on different machines, so their times do not compare exactly.
- The built `load` path has a second lookup, `cache.get(realPath) ?? state.cache.get(realPath) ?? state.ssrCache.get(realPath)`, which has the same key. It was read and not tested.
- macOS was not tested. The server environment uses a separate cache and was not isolated here.

## Not a duplicate of

- #12044: it reports the cost of `compileSfc` per file for props typed through a barrel, and the compile of the server environment by the hook (a separate cache). This issue is about the client environment cache missing on Windows, for a component with no imported props type.
- #10790: it keeps Windows alias spellings on the type checker's stat path. It is a different package and a different cache.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
