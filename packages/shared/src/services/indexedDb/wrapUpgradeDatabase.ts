import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { UpgradeDatabase } from "#src/models/indexedDb/UpgradeDatabase";

import { wrapDatabase } from "#src/services/indexedDb/wrapDatabase";
import { wrapObjectStore } from "#src/services/indexedDb/wrapObjectStore";

export const wrapUpgradeDatabase = <TSchema extends DatabaseSchema = DatabaseSchema>(
  database: IDBDatabase,
): UpgradeDatabase<TSchema> => ({
  ...wrapDatabase<TSchema>(database),
  createObjectStore: (name, options) =>
    wrapObjectStore<TSchema, typeof name, "versionchange">(database.createObjectStore(name, options)),
});
