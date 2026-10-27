# @esposter/azure

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

The Azure wire conventions that a real client and a fake one both have to speak: the OData filter clause vocabulary shared by Table Storage and Search, the entity key casing convention, and the service limits.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm add @esposter/azure
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                      | Kind     | Purpose                                                                      |
| --------------------------- | -------- | ---------------------------------------------------------------------------- |
| `AZURE_MAX_PAGE_SIZE`       | const    | Largest page size the service returns in one call                            |
| `BinaryOperator`            | enum     | Comparison operators Table Storage understands                               |
| `Clause`                    | type     | A filter condition on one property, the unit OData strings are built from    |
| `CompositeKey`              | class    | The `partitionKey` and `rowKey` pair every Table entity carries              |
| `CompositeKeyPropertyNames` | const    | The `CompositeKey` property names, so callers never restate the strings      |
| `deserializeClause`         | function | Parses a serialized filter clause back into a `Clause`, throwing on no match |
| `escapeValue`               | function | Quotes a string as an OData literal, doubling embedded single quotes         |
| `getPartitionKeyFilter`     | function | The filter selecting everything under one partition key                      |
| `getTableNullClause`        | function | The Table Storage "is null" clause, a negated `NaN` comparison               |
| `SearchOperator`            | enum     | Collection predicates only Azure Search supports                             |
| `serializeClauses`          | function | Serializes clauses into a Table Storage OData filter string                  |
| `serializeValue`            | function | Renders one `SerializableValue` as a literal for Table or Search             |

### Clauses

A `Clause<T>` is a filter condition expressed against a property of `T`, and it is what the OData string is
built from rather than the string being assembled by hand. `BinaryOperator` covers the comparisons Table
Storage understands; `SearchOperator` covers the collection predicates only Azure Search does; `UnaryOperator`
is how clauses are combined.

```ts
import type { Clause } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

const clause: Clause<{ createdAt: Date }> = { key: "createdAt", operator: BinaryOperator.Ge, value: new Date(0) };
```

### Values

`serializeValue` renders a `SerializableValue` the way the target service expects — Table Storage wants a
`datetime'<iso>'` literal for a `Date`, Search wants the bare ISO string, and `isTableFilter` selects between
them. Strings go through `escapeValue`, which doubles embedded single quotes so a value can never close its own
literal and append filter syntax of its own.

```ts
import { escapeValue, serializeValue } from "@esposter/azure";
```

### Filters

`serializeClauses` turns a clause array into a Table Storage filter string and `serializeSearchClauses` into a
Search one; the two differ only in how a `Date` renders. Clauses on the same key are grouped — a range pair is
joined with `and`, anything else with `or` — so a caller never assembles the boolean structure by hand.
`deserializeClause` is the inverse.

```ts
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";

const roomId = "00000000-0000-0000-0000-000000000000";
const filter = serializeClauses([
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
  getTableNullClause("deletedAt"),
]);
```

Null is where the two services diverge and the helpers carry the difference: `getTableNullClause` expresses "is null" for Table Storage, while Search supports it directly through `getSearchNullClause` / `getSearchNonNullClause`. `getPartitionKeyFilter` is the one-clause case worth naming, since a read, a count and a purge of the same entity must all start from it.

### Keys

`CompositeKey` is the `partitionKey`/`rowKey` pair every Table entity carries, and `CompositeKeyPropertyNames`
is how those names are referred to without restating the strings. `serializeKey` and `deserializeKey` convert
at the boundary.

```ts
import { CompositeKey, CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";
```

### Limits

`AZURE_MAX_BATCH_SIZE`, `AZURE_MAX_PAGE_SIZE` and `AZURE_MAX_QUEUE_VISIBILITY_TIMEOUT_MS` are the service's own
ceilings, named so a caller paginating, batching or enqueueing does not hard-code them.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/azure/latest?color=1b7a5f
[url-npm]: https://www.npmjs.com/package/@esposter/azure/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/azure/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/azure.svg
