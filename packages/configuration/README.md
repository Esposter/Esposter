# @esposter/configuration

[![Apache-2.0 licensed][badge-license]][url-license]

Shared build and lint configuration for all Esposter packages. Provides ESLint configs, TSConfig bases, and the tsdown build configurations every package's `tsdown.config.ts` composes.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs) to level up.

### What's Included

| Config        | File                         | Purpose                                                                 |
| ------------- | ---------------------------- | ----------------------------------------------------------------------- |
| ESLint        | `eslint/`                    | Shared ESLint rules (oxlint + typescript-eslint + perfectionist)        |
| tsdown (base) | `getTsdownConfiguration`     | Platform-neutral bundle config, plus the gates a published package owes |
| tsdown (Node) | `getTsdownConfigurationNode` | The base, targeting Node                                                |
| tsdown (Vue)  | `getTsdownConfigurationVue`  | The base, compiling `.vue` files and emitting their declarations        |
| ctix          | `.ctirc-ts`                  | Barrel file generation config for `packages/*/src/index.ts`             |
| ctix (bin)    | `generate-exports`           | Runs that generation on its own, which is what every `export:gen` calls |

### Usage in other packages

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

### Commands

Run from `packages/configuration/`:

```bash
pnpm build        # compile to dist/
pnpm lint         # check
pnpm lint:fix     # auto-fix
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
