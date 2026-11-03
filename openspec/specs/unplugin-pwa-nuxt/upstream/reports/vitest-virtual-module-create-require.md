On Windows, importing a virtual module whose resolved id starts with `/` fails with `The argument 'filename' must be a file URL object, file URL string, or absolute path string`

## Describe the bug

A test that imports a virtual module fails on Windows when the plugin resolves the import to an id that starts with `/` and has no `\0` prefix, for example `/@scope/virtual:foo`. `createRequire` receives `file:///@scope/virtual:foo`, which has no drive letter, and Node rejects it. The same test passes on Linux and passes with vitest 4.0.16.

## Reproduction

`package.json`:

```json
{ "private": true, "type": "module", "devDependencies": { "vitest": "5.1.0" } }
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

const RESOLVED_ID = "/@scope/virtual:foo";

export default defineConfig({
  plugins: [
    {
      name: "virtual-foo",
      enforce: "pre",
      resolveId(id) {
        if (id === "virtual:foo") return RESOLVED_ID;
      },
      load(id) {
        if (id === RESOLVED_ID) return 'export default "foo";';
      },
    },
  ],
});
```

`virtual.test.ts`:

```ts
import foo from "virtual:foo";
import { expect, it } from "vitest";

it("imports a virtual module", () => {
  expect(foo).toBe("foo");
});
```

Run `pnpm install`, then `pnpm vitest --run`.

## Actual

```
TypeError: The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received 'file:///@scope/virtual:foo'
```

The stack ends in `VitestModuleEvaluator.createRequire`, called from `_createCJSGlobals`.

## Expected

The test passes, as it does on Linux and as it did before `createRequire` received `import.meta.url`.

## Cause

Likely. The cause was read in the source at tag `v5.1.0`, and no patch was run for this report.

- `packages/vitest/src/runtime/moduleRunner/moduleEvaluator.ts:281` is `const require = this.createRequire(context[ssrImportMetaKey].url)`. This runs for every inlined module while `injectCjsGlobals` is on, which is the default.
- Vite builds that URL with `posixPathToFileHref` (`packages/vite/src/module-runner/utils.ts:46` at `v8.3.5`). For the id `/@scope/virtual:foo` the result is `file:///@scope/virtual:foo`.
- Line 454 passes the URL to Node's `createRequire`. On Windows, Node rejects a `file:` URL without a drive letter.
- The change that introduced this is #9441. It replaced `createRequire(filename)` with `createRequire(meta.url)` and removed the guard `if (filename[0] === '\x00' || !isAbsolute(filename)) return () => ({})`. The `\0` convention was the only id form that guard covered, and a `/`-prefixed virtual id fails the same way now.

The change that would fix it: catch the `ERR_INVALID_ARG_VALUE` error in `createRequire` and return a function that throws only when called.

## System Info

```
  System:
    OS: Windows 11 10.0.26300
    CPU: (16) x64 AMD Ryzen 7 7730U with Radeon Graphics
  Binaries:
    Node: 26.13.0
    pnpm: 12.16.1
  npmPackages:
    vitest: 5.1.0 => 5.1.0
```

Vite is 8.3.5, the version vitest 5.1.0 installs.

## Used Package Manager

pnpm

## Real occurrence

The id comes from `@unplugin-pwa/vite`, which resolves `virtual:pwa-register/vue` to `/@unplugin-pwa/virtual:pwa-register/vue`. The line below keeps a Nuxt module out of the test run for this reason:
https://github.com/Esposter/Esposter/blob/d8071dd2d8008c26acfadb1f8a102823dc07c605/apps/web/configuration/modules.ts#L23

## Isolation

One change at a time from the reproduction, on Windows.

| Change                                             | Result                                  |
| :------------------------------------------------- | :-------------------------------------- |
| None                                               | Fails                                   |
| `vitest` 4.0.16                                    | Passes                                  |
| `test: { injectCjsGlobals: false }`                | Passes                                  |
| Resolved id `\0/@scope/virtual:foo`                | Passes                                  |
| Resolved id `@scope/virtual:foo`, no leading slash | Passes                                  |
| Resolved id `/virtual:foo`, no scope               | Fails: `Received 'file:///virtual:foo'` |
| Linux (WSL Ubuntu)                                 | Passes                                  |

## Not known

- I did not run the versions between 4.0.16 and 5.1.0, so the first failing release is not named. #9441 is the change that matches.
- I ran Node 26.13.0 on Windows only, and Node 26.11.1 on Linux.
- A `\0` prefix is the documented convention for a virtual id. The plugin that produces the `/` form is not changed by this report, and the ask is that vitest handles an id that Vite and Rollup accept.

## Not a duplicate of

- #9310 and its fix #9441: they made `createRequire` use `meta.url`. This report is the case that change leaves broken.
- #10709: it adds `injectCjsGlobals`, which is the workaround in the table. It is not a fix for the default.
- #11036: a Windows crash on `file:` URLs without a drive letter, in the coverage provider. The caller and the message differ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
