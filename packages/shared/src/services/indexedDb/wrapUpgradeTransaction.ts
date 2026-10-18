import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";

import { getResultAsync } from "#src/services/error/getResultAsync";
import { getTransactionDone } from "#src/services/indexedDb/getTransactionDone";
import { getTransactionObjectStore } from "#src/services/indexedDb/getTransactionObjectStore";
import { noop } from "#src/util/function/noop";

// An upgrade's outcome is the open request's, and a failed upgrade rejects that. So `done` is made before the upgrade
// Callback runs, which keeps a read after the transaction has settled from waiting on an event that already fired.
// Its rejection is handled here so a failed upgrade nobody reads leaves no unhandled rejection. It is logged only when
// The transaction carries an error of its own: a throw in the upgrade is logged by the open, and its abort carries none
export const wrapUpgradeTransaction = <TSchema extends DatabaseSchema>(
  transaction: IDBTransaction,
): DatabaseTransaction<TSchema, DatabaseStoreName<TSchema>, "versionchange"> => {
  const done = getTransactionDone(transaction);
  getResultAsync(() => done).match(noop, (error) => {
    if (transaction.error) console.error(error);
  });

  return {
    get done() {
      return done;
    },
    objectStore: getTransactionObjectStore<TSchema, "versionchange">(transaction),
  };
};
