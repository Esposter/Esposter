# nuxt-security-module

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A Nuxt security module for [Nitro 3](https://nitro.build) and h3 2 that sets security headers on rendered pages, a per-request nonce Content Security Policy, subresource integrity, CORS, allowed methods, basic auth and a request size limit.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/nuxt-security-module).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
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

## <a name="key-exports">🧩 Key Exports</a>

| Export                   | Kind      | Purpose                                                                                                                  |
| :----------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------- |
| `createRouteRulesPlugin` | function  | Exported from `./runtime/nitro/plugins/routeRules`: the plugin that matches each request against the build's route rules |
| `default`                | const     | The Nuxt module, set up from the `security` config key; each feature registers only when its option is on                |
| `ModuleOptions`          | interface | The module's options, one key per feature, each on or off; the `security` config key takes a partial of them             |
| `rateLimiter`            | const     | Default export of `./runtime/server/middleware/rateLimiter`: refuses a request with `429` once its key's window is spent |

## <a name="usage">📝 Usage</a>

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

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/nuxt-security-module/latest?color=038758
[url-npm]: https://www.npmjs.com/package/nuxt-security-module/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/nuxt-security-module/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/nuxt-security-module.svg
