import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export type DatabaseIndexKey<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TIndexName extends DatabaseIndexName<TSchema, TStoreName>,
> = TSchema[TStoreName]["indexes"][TIndexName];
