import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";

import { getTransactionDone } from "#src/services/indexedDb/getTransactionDone";
import { getTransactionObjectStore } from "#src/services/indexedDb/getTransactionObjectStore";

// An upgrade's outcome is the open request's, and a failed upgrade rejects that. So `done` is made when read, which
// Keeps a rejected upgrade from also leaving an unhandled rejection nothing was ever going to await
export const wrapUpgradeTransaction = <TSchema extends DatabaseSchema>(
  transaction: IDBTransaction,
): DatabaseTransaction<TSchema, DatabaseStoreName<TSchema>, "versionchange"> => ({
  get done() {
    return getTransactionDone(transaction);
  },
  objectStore: getTransactionObjectStore<TSchema, "versionchange">(transaction),
});
