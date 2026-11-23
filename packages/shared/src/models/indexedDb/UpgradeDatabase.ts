import type { Database } from "#src/models/indexedDb/Database";
import type { DatabaseObjectStore } from "#src/models/indexedDb/DatabaseObjectStore";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface UpgradeDatabase<TSchema extends DatabaseSchema = DatabaseSchema> extends Database<TSchema> {
  createObjectStore: <TStoreName extends DatabaseStoreName<TSchema>>(
    name: TStoreName,
    options?: IDBObjectStoreParameters,
  ) => DatabaseObjectStore<TSchema, TStoreName, "versionchange">;
  // An earlier version's store is among the stores the database holds, and the schema no longer names it, so a name is
  // Any string
  deleteObjectStore: (name: string) => void;
  // The stores the database holds when the upgrade opens, a snapshot, so a loop over it can delete the stores it names.
  // An Earlier version's store is among them, and a store the new version adds is not
  objectStoreNames: string[];
}
