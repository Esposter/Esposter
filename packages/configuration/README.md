# @esposter/configuration

[![Apache-2.0 licensed][badge-license]][url-license]

Shared build and lint configuration for all Esposter packages. Provides ESLint configs, TSConfig bases, and Rolldown build configurations for browser, isomorphic, and Node.js targets.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### What's Included

| Config                | File                              | Purpose                                                          |
| --------------------- | --------------------------------- | ---------------------------------------------------------------- |
| ESLint                | `eslint/`                         | Shared ESLint rules (oxlint + typescript-eslint + perfectionist) |
| Rolldown (browser)    | `rolldownConfigurationBrowser`    | Vite-compatible browser bundle config                            |
| Rolldown (isomorphic) | `rolldownConfigurationIsomorphic` | Bundle for packages that run in both environments                |
| Rolldown (Node)       | `rolldownConfigurationNode`       | Server-only package bundle config                                |
| ctix                  | `.ctirc-ts`                       | Barrel file generation config for `packages/*/src/index.ts`      |

### Usage in other packages

```ts
// rolldown.config.ts
import { rolldownConfigurationIsomorphic } from "@esposter/configuration";
export default rolldownConfigurationIsomorphic;
```

```json
// .eslintrc or eslint.config.js
{ "extends": "@esposter/configuration/eslint" }
```

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
