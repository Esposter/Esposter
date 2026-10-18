# Azure Table read

The server-side path that turns an Azure Table row back into a class instance, before any transport sees it. The path and its shared rule are on [serialization](../README.md).

The Azure SDK already returns `Date` objects for columns stored as `Edm.DateTime`. For columns stored as JSON strings (arrays, nested objects), `checkIsSerializable` detects them and `jsonDateParse` restores any dates inside.

`deserializeEntity.ts` (`packages/db/src/services/azure/transformer/deserializeEntity.ts`) builds the instance:

```ts
const instance = new cls(); // restores class identity
for (const [property, value] of Object.entries(entity))
  if (!(value instanceof Date) && checkIsSerializable(instance[property]))
    instance[property] = jsonDateParse(String(value)); // JSON column → parse + restore dates
  else instance[property] = value; // date column → already a Date
```

`checkIsSerializable` returns `true` for arrays and non-Date objects — i.e. properties that were stored in Azure Table as a JSON string (e.g. `files: FileEntity[]`, `mentions: string[]`).

The message entity class is selected per row by the `type` discriminant through `MessageTypeEntityMap` in `@esposter/db-schema`, so a new message entity type is registered there as well as in the [class registry](../class-registry/design.md).
