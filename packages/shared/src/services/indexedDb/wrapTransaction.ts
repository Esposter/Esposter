import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";

import { getTransactionDone } from "#src/services/indexedDb/getTransactionDone";
import { getTransactionObjectStore } from "#src/services/indexedDb/getTransactionObjectStore";

export const wrapTransaction = <
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TMode extends IDBTransactionMode,
>(
  transaction: IDBTransaction,
): DatabaseTransaction<TSchema, TStoreName, TMode> => ({
  done: getTransactionDone(transaction),
  objectStore: getTransactionObjectStore<TSchema, TMode>(transaction),
});
