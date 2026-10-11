import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";
import type { UpgradeDatabase } from "#src/models/indexedDb/UpgradeDatabase";

export interface DatabaseOpenOptions<TSchema extends DatabaseSchema = DatabaseSchema> {
  blocked?: (currentVersion: number, blockedVersion: null | number) => void;
  blocking?: (currentVersion: number, blockedVersion: null | number) => void;
  terminated?: () => void;
  upgrade?: (
    database: UpgradeDatabase<TSchema>,
    oldVersion: number,
    newVersion: null | number,
    transaction: DatabaseTransaction<TSchema, DatabaseStoreName<TSchema>, "versionchange">,
  ) => void;
}
