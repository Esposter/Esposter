import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseIndexCreator<TSchema extends DatabaseSchema, TStoreName extends DatabaseStoreName<TSchema>> {
  createIndex: (
    name: DatabaseIndexName<TSchema, TStoreName>,
    keyPath: string | string[],
    options?: IDBIndexParameters,
  ) => void;
}
