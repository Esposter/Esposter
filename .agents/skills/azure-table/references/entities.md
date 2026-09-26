# Entity Classes and Soft-Delete

Read when writing an Azure entity class, or soft-deleting a row.

## Entity class constructors

`deserializeEntity` calls `new cls()` with **no arguments**, so every Azure entity constructor must declare `init` optional (`init?:`) and access via optional chaining:

```ts
export class MyEntity extends AzureEntity {
  declare myField: string;

  constructor(init?: Partial<MyEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
    this.myField = init?.myField ?? "default"; // use ?. not just .
  }
}
```

## Soft-delete

Set `deletedAt` and `updatedAt` together via `serializeEntity`. `getTableNullClause(ItemMetadataPropertyNames.deletedAt)` filters to non-deleted rows only, and a partition-scoped read takes it through `getLivePartitionClauses` (`references/filters.md`).

```ts
const now = new Date();
serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now });
```
