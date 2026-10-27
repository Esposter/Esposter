# nuxt-security-module

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Nuxt security module for [Nitro 3](https://nitro.build) and h3 2 that sets security headers on rendered pages, a per-request nonce Content Security Policy, subresource integrity, CORS, allowed methods, basic auth and a request size limit.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i nuxt-security-module
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({ modules: ["nuxt-security-module"] });
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/nuxt-security-module) to level up.

The nonce is written onto the page's own tags, the prerender policy is a `<meta>` element, and the framework's `X-Powered-By` header is removed. It replaces [nuxt-security](https://github.com/Baroshem/nuxt-security). Its upstream audit, every issue it was held to, and the defaults it ships are on the documentation page: [nuxt-security-module](https://github.com/Esposter/Esposter/blob/main/openspec/specs/nuxt-security-module/README.md).

The module's option reference, its upstream audit and its defaults review live in the repository's [specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/nuxt-security-module). The package's status and the steps not yet built are in its `README.md` there.

### Key Exports

| Export                   | Kind      | Purpose                                                                                                                  |
| :----------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------- |
| `createRouteRulesPlugin` | function  | Exported from `./runtime/nitro/plugins/routeRules`: the plugin that matches each request against the build's route rules |
| `default`                | const     | The Nuxt module, set up from the `security` config key; each feature registers only when its option is on                |
| `ModuleOptions`          | interface | The module's options, one key per feature, each on or off; the `security` config key takes a partial of them             |
| `rateLimiter`            | const     | Default export of `./runtime/server/middleware/rateLimiter`: refuses a request with `429` once its key's window is spent |

### Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-security-module"],
  security: {
    // Refuses a client with 429 after 100 requests in each minute-long window
    rateLimiter: { intervalInMilliseconds: 60000, tokensPerInterval: 100 },
  },
});
```

## <a name="commands">⌨️ Commands</a>

```bash
pnpm bench       # Runs the benchmarks with Vitest
pnpm build       # Builds `dist`
pnpm lint        # Lints the package
pnpm lint:fix    # Lints the package and fixes what it can
pnpm test        # Runs the tests with Vitest in watch mode
pnpm typecheck   # Typechecks the package
```

## <a name="related">🔗 Related Documentation</a>

- [Nitro](https://nitro.build/)
- [Nuxt](https://nuxt.com/docs)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/nuxt-security-module/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/nuxt-security-module/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/nuxt-security-module/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/nuxt-security-module.svg
