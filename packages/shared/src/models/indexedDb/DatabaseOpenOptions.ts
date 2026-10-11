import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { UpgradeDatabase } from "#src/models/indexedDb/UpgradeDatabase";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseOpenOptions<TSchema extends DatabaseSchema = DatabaseSchema> {
  blocked?: (currentVersion: number, blockedVersion: number | null) => void;
  blocking?: (currentVersion: number, blockedVersion: number | null) => void;
  terminated?: () => void;
  upgrade?: (
    database: UpgradeDatabase<TSchema>,
    oldVersion: number,
    newVersion: number | null,
    transaction: DatabaseTransaction<TSchema, DatabaseStoreName<TSchema>, "versionchange">,
  ) => void;
}
