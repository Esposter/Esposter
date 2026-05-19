# @esposter/shared

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Shared TypeScript utilities, types, and error classes for the Esposter platform. Works in both browser and server environments.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i @esposter/shared
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/shared.html) to level up.

### Key Exports

#### Error Classes

```ts
import { InvalidOperationError, NotFoundError, ForbiddenError, NotInitializedError } from "@esposter/shared";

throw new InvalidOperationError(Operation.Read, file.name, zodError.message);
```

#### Array Utilities

```ts
import { takeOne } from "@esposter/shared";

// Safe index access — throws on out-of-bounds instead of returning undefined
const first = takeOne(items, 0);
```

#### Type Utilities

```ts
import type { ToData, DeepOmit, GetPaths } from "@esposter/shared";

// ToData<T> — strips class methods, returns plain data shape
type RawColumn = ToData<Column>;
```

#### Reactivity

```ts
import { toRawDeep, getRawData } from "@esposter/shared";

// Recursively unwrap Vue reactive proxies
const raw = toRawDeep(reactiveObject);
```

#### Text / String

```ts
import { capitalize, truncate, toKebabCase } from "@esposter/shared";
```

#### Error Handling (Result Pattern)

```ts
import { getResult, getResultAsync, withFinalizer } from "@esposter/shared";
```

### Commands

Run from `packages/shared/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode
pnpm coverage     # vitest run --coverage
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/shared/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/shared/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/shared/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/shared.svg
