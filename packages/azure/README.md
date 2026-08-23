# @esposter/azure

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

The parts of Azure's wire contract that both a real client and a fake one have to agree on: the OData filter
clause vocabulary shared by Table Storage and Search, the entity key casing convention, and the service limits.
No SDK client is constructed here and no credential is read — this package is pure data and pure functions, so
it runs anywhere.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm add @esposter/azure
```

## <a name="documentation">📖 Documentation</a>

### Clauses

A `Clause<T>` is a filter condition expressed against a property of `T`, and it is what the OData string is
built from rather than the string being assembled by hand. `BinaryOperator` covers the comparisons Table
Storage understands; `SearchOperator` covers the collection predicates only Azure Search does; `UnaryOperator`
is how clauses are combined.

```ts
import type { Clause } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

const clause: Clause<{ createdAt: Date }> = { key: "createdAt", operator: BinaryOperator.ge, value: new Date(0) };
```

### Values

`serializeValue` renders a `SerializableValue` the way the target service expects — Table Storage wants a
`datetime'<iso>'` literal for a `Date`, Search wants the bare ISO string, and `isTableFilter` selects between
them. Strings go through `escapeValue`, which doubles embedded single quotes so a value can never close its own
literal and append filter syntax of its own.

```ts
import { escapeValue, serializeValue } from "@esposter/azure";
```

### Keys

`CompositeKey` is the `partitionKey`/`rowKey` pair every Table entity carries, and `CompositeKeyPropertyNames`
is how those names are referred to without restating the strings.

```ts
import { CompositeKey, CompositeKeyPropertyNames } from "@esposter/azure";
```

### Limits

`AZURE_MAX_BATCH_SIZE` and `AZURE_MAX_PAGE_SIZE` are the service's own ceilings, named so a caller paginating or
batching does not hard-code them.

### Commands

Run from `packages/azure/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/azure/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/azure/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/azure/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/azure.svg
