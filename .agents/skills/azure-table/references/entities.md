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

## What a write stores

`serializeEntity` stores an empty string as `""` and an empty array as `"[]"`, and stores a property whose value is `undefined` as no property, so the row reads back without it. `Object.assign(this, init)` copies an own `undefined` over a class default, so an entity built from an input that carries an `undefined` key stores nothing for that field: `createMessageEntity` drops the undefined keys of its input before building, so a class default always applies. A schema default on an entity is legitimate only where a current writer still produces the absence (`openspec/specs/architecture/persisted-data-latest-shape-only/design.md`, the Azure Table paragraph).

## Soft-delete

Set `deletedAt` and `updatedAt` together via `serializeEntity`. `getTableNullClause(ItemMetadataPropertyNames.deletedAt)` filters to non-deleted rows only, and a partition-scoped read takes it through `getLivePartitionClauses` (`references/filters.md`).

```ts
const now = new Date();
serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now });
```
