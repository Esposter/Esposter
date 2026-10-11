import type { DatabaseIndexKey } from "#src/models/indexedDb/DatabaseIndexKey";
import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseIndex<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TIndexName extends DatabaseIndexName<TSchema, TStoreName>,
> {
  getAll: (
    query?: DatabaseIndexKey<TSchema, TStoreName, TIndexName> | IDBKeyRange | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["value"][]>;
  getAllKeys: (
    query?: DatabaseIndexKey<TSchema, TStoreName, TIndexName> | IDBKeyRange | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["key"][]>;
}
