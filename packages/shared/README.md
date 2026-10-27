# @esposter/shared

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Shared TypeScript utilities, types, and error classes for the Esposter platform.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/shared).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i @esposter/shared zod
```

Works in both browser and server environments.

## <a name="key-exports">🧩 Key Exports</a>

#### Error Classes

```ts
import { InvalidOperationError, NotFoundError, ForbiddenError, NotInitializedError } from "@esposter/shared";

throw new InvalidOperationError(Operation.Read, file.name, zodError.message);
```

#### Array Utilities

```ts
import { takeOne } from "@esposter/shared";

// The first item, typed without `undefined`; an out-of-bounds index still yields `undefined` at runtime
const first = takeOne(items);
```

#### Type Utilities

```ts
import type { ToData, DeepOmit, GetPaths } from "@esposter/shared";

// ToData<T> — the plain data shape of T, with its `toJSON` method removed at every depth
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

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/shared/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/shared/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/shared/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/shared.svg
