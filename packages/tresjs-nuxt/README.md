# tresjs-nuxt

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Nuxt module for TresJS that auto-imports the TresJS core API, registers TresCanvas for client and server, and registers every installed @tresjs package's components and composables, with no devtools UI of its own.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i tresjs-nuxt
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/tresjs-nuxt) to level up.

### Key Exports

| Export          | Kind      | Purpose                                                                                                                    |
| :-------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------- |
| `default`       | const     | The Nuxt module: auto-imports the TresJS core API, registers `TresCanvas` and each installed `@tresjs/*` package's exports |
| `ModuleOptions` | interface | The `tres` config key: `glsl` loads the `vite-plugin-glsl` peer, and `modules` names extra packages whose exports register |

### Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["tresjs-nuxt"],
  // Loads the optional vite-plugin-glsl peer, which the app installs itself
  tres: { glsl: true },
});
```

## <a name="commands">⌨️ Commands</a>

Run from `packages/tresjs-nuxt/`:

```bash
pnpm build        # compile to dist/
pnpm lint         # lint the package
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Nuxt](https://nuxt.com/docs)
- [three.js](https://threejs.org/docs/)
- [TresJS](https://tresjs.org/)
- [Vitest](https://vitest.dev/guide/)
- [Vue](https://vuejs.org/guide/introduction.html)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/tresjs-nuxt/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/tresjs-nuxt/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/tresjs-nuxt/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/tresjs-nuxt.svg
