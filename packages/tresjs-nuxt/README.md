# tresjs-nuxt

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Nuxt module for TresJS that auto-imports the TresJS core API, registers TresCanvas for client and server, and registers every installed @tresjs package's components and composables, with no devtools UI of its own.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/tresjs-nuxt).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i tresjs-nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["tresjs-nuxt"],
  // Loads the optional vite-plugin-glsl peer, which the app installs itself
  tres: { glsl: true },
});
```

## <a name="key-exports">🧩 Key Exports</a>

| Export          | Kind      | Purpose                                                                                                                    |
| :-------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------- |
| `default`       | const     | The Nuxt module: auto-imports the TresJS core API, registers `TresCanvas` and each installed `@tresjs/*` package's exports |
| `ModuleOptions` | interface | The `tres` config key: `glsl` loads the `vite-plugin-glsl` peer, and `modules` names extra packages whose exports register |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/tresjs-nuxt/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/tresjs-nuxt/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/tresjs-nuxt/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/tresjs-nuxt.svg
