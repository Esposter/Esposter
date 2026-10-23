# nuxt-security-module

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Nuxt security module for [Nitro 3](https://nitro.build) and h3 2. It sets security headers on rendered pages, a per-request nonce Content Security Policy with the nonce written onto the page's own tags, subresource integrity, a prerender policy as a `<meta>` element, the framework's `X-Powered-By` header removed, CORS, allowed methods, basic auth and a request size limit.

It replaces [nuxt-security](https://github.com/Baroshem/nuxt-security). Its upstream audit, every issue it was held to, and the defaults it ships are on the documentation page: [nuxt-security-module](https://github.com/Esposter/Esposter/blob/main/openspec/specs/nuxt-security-module/README.md).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
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

The module's option reference, its upstream audit and its defaults review live in the repository's [specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/nuxt-security-module). The package's status and the steps not yet built are in its `README.md` there.

---

## <a name="license">⚖️ License</a>

Apache-2.0

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/nuxt-security-module/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/nuxt-security-module/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/nuxt-security-module/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/nuxt-security-module.svg
