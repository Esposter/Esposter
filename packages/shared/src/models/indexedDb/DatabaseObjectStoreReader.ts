import type { DatabaseIndex } from "#src/models/indexedDb/DatabaseIndex";
import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseObjectStoreReader<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
> {
  get: (key: TSchema[TStoreName]["key"]) => Promise<TSchema[TStoreName]["value"] | undefined>;
  getAll: (
    query?: IDBKeyRange | TSchema[TStoreName]["key"] | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["value"][]>;
  getAllKeys: (
    query?: IDBKeyRange | TSchema[TStoreName]["key"] | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["key"][]>;
  index: <TIndexName extends DatabaseIndexName<TSchema, TStoreName>>(
    name: TIndexName,
  ) => DatabaseIndex<TSchema, TStoreName, TIndexName>;
}
