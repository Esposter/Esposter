The register module imports `@vite-pwa/workbox-window`, which Vite resolves from the app's root, so an app that does not install it cannot build

## Summary

`vite build` fails on `virtual:pwa-register` when the app does not list `@vite-pwa/workbox-window` as its own dependency. The package is a `dependency` of `@unplugin-pwa/vite`. The same project builds when `@vite-pwa/workbox-window` is in its own `node_modules`.

## Environment

- `@unplugin-pwa/vite` 0.0.3 (the newest release), `@unplugin-pwa/core` 0.0.3
- `vite` 8.3.5, `rolldown` 1.2.16, `magicast` 0.5.5, `@vite-pwa/workbox-swkit` 8.0.13, `@vite-pwa/workbox-window` 8.0.13
- Windows 11, Node 26.13.0, pnpm 12.16.1 with default settings (isolated `node_modules`, no hoisting)
- Source of truth: the same project with `@vite-pwa/workbox-window` added as a direct dependency

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "@unplugin-pwa/vite": "0.0.3",
    "@vite-pwa/workbox-swkit": "8.0.13",
    "magicast": "0.5.5",
    "vite": "8.3.5"
  }
}
```

`vite.config.js`:

```js
import { VitePWA } from "@unplugin-pwa/vite";

export default { plugins: [VitePWA()] };
```

`index.html`:

```html
<!doctype html>
<script type="module" src="./main.js"></script>
```

`main.js`:

```js
import { registerSW } from "virtual:pwa-register";

registerSW();
```

`@vite-pwa/workbox-swkit` is installed because the build fails on that package first without it (see Isolation). Run `pnpm install`, then `pnpm vite build`.

## Actual

```
asset.js (8:47) [UNRESOLVED_IMPORT] Could not resolve '@vite-pwa/workbox-window/esm-sw-detector' in asset.js
asset.js (23:21) [UNRESOLVED_IMPORT] Could not resolve '@vite-pwa/workbox-window' in asset.js
✗ Build failed in 120ms
Error: [vite]: Rolldown failed to resolve import "@vite-pwa/workbox-window/esm-sw-detector" from "/@unplugin-pwa/virtual:pwa-register".
```

The command exits with status 1.

## Expected

The build passes with the packages the README asks for, which are `@unplugin-pwa/vite` and, for `generateSW`, `magicast`. With `@vite-pwa/workbox-window` added to `devDependencies`, the same files build with status 0 and no warning.

## Cause

Likely. The cause was read in the source and not confirmed by a patch, at tag `v0.0.3`.

- `packages/vite/package.json:110` lists `@vite-pwa/workbox-window` in `dependencies`, and `packages/vite/src/client/build/register.ts:3` and `:32` import it by its bare name. The built `dist/client/build/register.js` keeps both imports.
- `packages/core/src/build-pwa-asset.ts:109` is `const input = 'asset.js'`, and `:129` calls `rolldown({ input, ... })` without a `cwd`. The `UNRESOLVED_IMPORT` warnings come from this build.
- The Vite stage then resolves the emitted bare import with the importer `/@unplugin-pwa/virtual:pwa-register`. That importer has no directory, so Vite resolves the import from the app's root.

The change that would fix it: resolve the `@vite-pwa/*` specifiers that the register code imports from the plugin's own location, with `this.resolve(source, <a file of the plugin>, { skipSelf: true })` in a `resolveId` hook. A plugin with that hook removes the Vite error in a test project. It does not remove the two `asset.js` warnings, which come from the separate Rolldown build.

## Real occurrence

The plugin below is the workaround, in a public Nuxt module that builds on `@unplugin-pwa/vite`:
https://github.com/Esposter/Esposter/blob/d8071dd2d8008c26acfadb1f8a102823dc07c605/packages/unplugin-pwa-nuxt/src/services/createWorkboxWindowPlugin.ts#L18

## Isolation

One change at a time from the reproduction. Each row is a fresh install and build.

| Change                                                                                                                  | Result                                                                                                                                             |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| None                                                                                                                    | Fails: `@vite-pwa/workbox-window/esm-sw-detector` unresolved                                                                                       |
| Add `@vite-pwa/workbox-window` to `devDependencies`                                                                     | Passes, status 0                                                                                                                                   |
| Run `vite build` from a directory where `@vite-pwa/workbox-window` is installed, with the project's own `vite` and root | Passes, status 0                                                                                                                                   |
| `injectRegister: null`                                                                                                  | Fails the same way, because `main.js` still imports the virtual module                                                                             |
| `injectRegister: "script"` and no virtual import in `main.js`                                                           | The build passes, but `dist/registerSW.js` keeps `import "@vite-pwa/workbox-window/esm-sw-detector"` and fails in Node with `ERR_MODULE_NOT_FOUND` |
| Remove `@vite-pwa/workbox-swkit`                                                                                        | Fails earlier: `Rolldown failed to resolve import "@vite-pwa/workbox-swkit/precaching" from "dist/sw-classic.js"`                                  |

## Not known

- `@vite-pwa/workbox-swkit` fails the same way one stage earlier, in `dist/sw-classic.js`. I did not read the code that builds that file.
- The README lists only `magicast` as a requirement. `BREAKING-CHANGES.md` lists `@vite-pwa/workbox-window` and `@vite-pwa/workbox-swkit` under `devDependencies`, as a mapping from the old package names. It does not say the plugin needs them. If an app must install them, the README is the place for that, and the ask changes from a fix to a documentation line.
- I did not run `virtual:pwa-register/vue`, `injectRegister: "inline"` or a browser.

## Not a duplicate of

- #44, `globDirectory` computed as a double-relative path: the same family, because it resolves against `process.cwd()`. The symptom and the code differ.
- #5, pending tasks before the first release: it lists an open note about `workbox-window`. It is a documentation task, not a build failure.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
