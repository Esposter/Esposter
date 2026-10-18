# nuxt-security-module

Nuxt security module for [Nitro 3](https://nitro.build) and h3 2. It sets security headers on rendered pages, a per-request nonce Content Security Policy with the nonce written onto the page's own tags, subresource integrity, a prerender policy as a `<meta>` element, the framework's `X-Powered-By` header removed, CORS, allowed methods, basic auth and a request size limit.

It replaces [nuxt-security](https://github.com/Baroshem/nuxt-security). Its upstream audit, every issue it was held to, and the defaults it ships are on the documentation page: [nuxt-security-module](https://github.com/Esposter/Esposter/blob/main/openspec/specs/nuxt-security-module/README.md).

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

The module's option reference, its upstream audit and its defaults review live in the repository's [specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/nuxt-security-module). The package's status and the steps not yet built are in its `README.md` there.

---

## <a name="license">⚖️ License</a>

Apache-2.0
