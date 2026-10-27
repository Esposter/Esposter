# @esposter/configuration

[![Apache-2.0 licensed][badge-license]][url-license]

Shared build and lint configuration for all Esposter packages, providing ESLint configs, TSConfig bases, and the tsdown build configurations every package's `tsdown.config.ts` composes.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="usage">📝 Usage</a>

```ts
// tsdown.config.ts
import { getTsdownConfiguration } from "@esposter/configuration";

export default getTsdownConfiguration();
```

```js
// eslint.config.js — flat config, one composed export
import eslintConfiguration from "@esposter/configuration/eslint/index.typescript.js";

export default eslintConfiguration.append({ ignores: ["dist"] });
```

Inside this monorepo a package composes the pieces itself instead, because each config extends the Nuxt-generated
one the app emits — copy `packages/db/eslint.config.js` rather than writing that wiring from scratch.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
