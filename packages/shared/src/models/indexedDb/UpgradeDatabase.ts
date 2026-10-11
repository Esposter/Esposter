import type { Database } from "#src/models/indexedDb/Database";
import type { DatabaseObjectStore } from "#src/models/indexedDb/DatabaseObjectStore";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface UpgradeDatabase<TSchema extends DatabaseSchema = DatabaseSchema> extends Database<TSchema> {
  createObjectStore: <TStoreName extends DatabaseStoreName<TSchema>>(
    name: TStoreName,
    options?: IDBObjectStoreParameters,
  ) => DatabaseObjectStore<TSchema, TStoreName, "versionchange">;
}
