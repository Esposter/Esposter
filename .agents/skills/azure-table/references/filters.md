# Filter Clauses

Read when building an OData filter for a table read, a count or a purge.

Build OData filter strings with `serializeClauses` from `@esposter/azure`.

- **Type the clause array with the entity being queried** (`const clauses: Clause<FooEntity>[] = [...]`) — `Clause` has no default, so typecheck rejects a bare `Clause[]` and a cast on the literal is the same widening written by hand.
- **Always `CompositeKeyPropertyNames` for `partitionKey`/`rowKey`** — never an entity's own `PropertyNames`, never a string literal.
- **Entity-specific fields stay on their own `PropertyNames` constant** — `FooEntityPropertyNames.bar`, with `ItemMetadataPropertyNames.deletedAt` for metadata.
- **Null clause helpers infer automatically** — `getTableNullClause(ItemMetadataPropertyNames.deletedAt)`, never `getTableNullClause<FooEntity>(...)` (`no-restricted-syntax`; a key read off an arbitrary clause, with no entity to infer from, disables it). `getCursorWhereAzureTable` returns `Clause<TItem>[]`, typed via a cast in its body since deserialized cursor keys are plain strings at runtime.

```ts
const clauses: Clause<StandardMessageEntity>[] = [
  ...getLivePartitionClauses<StandardMessageEntity>(roomId),
  { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: userId },
];
const filter = serializeClauses(clauses);
```

**A soft-deleted table's "live rows of this partition" is `getLivePartitionClauses(partitionKey)`** (`packages/db/src/services/azure/table/getLivePartitionClauses.ts`), never the partition clause and the `deletedAt` null clause spelled side by side — the pair is what every read of a room's messages, notes and log lines opens with, and a read that spelled only the first half would resurface what a delete hid.

**The null clause is the one filter Azurite evaluates differently from the real service, and the accepted gap is in the dev environment only.** `getTableNullClause` emits `not (deletedAt ne NaN)`, which the real service answers with live rows only: every row it returned had no `deletedAt`, every deleted row had one, and the two sets did not overlap. Azurite returns soft-deleted rows for the same filter, so in local dev a deleted message stays listed and its delete answers 404. Keep the form. `eq NaN` returns nothing on the real service, and `eq null` is rejected there. The gap is accepted until upstream fixes it: [Azurite#2342](https://github.com/Azure/Azurite/issues/2342) is open and covers the null comparison, but not this datetime form.

**"Everything under this partition" is `getPartitionKeyFilter(id)`** (`@esposter/azure`), never a hand-built one-clause `serializeClauses` call and never a template literal. Every table partitions on its owning entity's id, so a read, a count and a purge of the same entity all start from that one filter — writing it once is what keeps the three from disagreeing after a key-shape change. A feature that also filters on its own columns drops back to the clause array above.
