# @esposter/azure

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

It holds the Azure wire conventions that a real client and a fake client must both follow. They are the OData filter clause vocabulary shared by Table Storage and Search, the entity key casing convention and the service limits.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Install the package:

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

A `Clause<T>` is a filter condition on a property of `T`. The OData string is built from clauses. Do not assemble the string by hand.

- `BinaryOperator` holds the comparisons that Table Storage understands.
- `SearchOperator` holds the collection predicates that only Azure Search supports.
- `UnaryOperator` combines clauses.

```ts
import type { Clause } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

const clause: Clause<{ createdAt: Date }> = { key: "createdAt", operator: BinaryOperator.Ge, value: new Date(0) };
```

### Values

`serializeValue` renders a `SerializableValue` in the format that the target service expects. `isTableFilter` selects the format.

- Table Storage: a `Date` renders as a `datetime'<iso>'` literal.
- Search: a `Date` renders as the bare ISO string.

Strings go through `escapeValue`. It doubles each embedded single quote, so a value cannot close its own literal or add filter syntax of its own.

```ts
import { escapeValue, serializeValue } from "@esposter/azure";
```

### Filters

`serializeClauses` turns a clause array into a Table Storage filter string. `serializeSearchClauses` turns a clause array into a Search filter string. The two differ only in how a `Date` renders.

Clauses on the same key are grouped:

- A range pair is joined with `and`.
- Any other group is joined with `or`.

Do not assemble the boolean structure by hand. `deserializeClause` is the inverse.

```ts
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";

const roomId = "00000000-0000-0000-0000-000000000000";
const filter = serializeClauses([
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
  getTableNullClause("deletedAt"),
]);
```

The two services handle null differently. The helpers handle the difference.

- `getTableNullClause` expresses "is null" for Table Storage.
- Search supports null directly, through `getSearchNullClause` / `getSearchNonNullClause`.

`getPartitionKeyFilter` builds the one-clause filter that selects everything under one partition key. A read, a count and a purge of the same entity must all start from this filter.

### Keys

`CompositeKey` is the `partitionKey`/`rowKey` pair that every Table entity carries. Refer to these names through `CompositeKeyPropertyNames`. Do not restate the strings. `serializeKey` and `deserializeKey` convert keys at the boundary.

```ts
import { CompositeKey, CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";
```

### Limits

These constants hold the maximum values that the service allows: `AZURE_MAX_BATCH_SIZE`, `AZURE_MAX_PAGE_SIZE` and `AZURE_MAX_QUEUE_VISIBILITY_TIMEOUT_MS`. Use them when you paginate, batch or enqueue. Do not hard-code these values.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/azure/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/azure/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/azure/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/azure.svg
