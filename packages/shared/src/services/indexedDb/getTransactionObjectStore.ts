import type { DatabaseObjectStore } from "#src/models/indexedDb/DatabaseObjectStore";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

import { wrapObjectStore } from "#src/services/indexedDb/wrapObjectStore";

export const getTransactionObjectStore =
  <TSchema extends DatabaseSchema, TMode extends IDBTransactionMode>(transaction: IDBTransaction) =>
  <TStoreName extends DatabaseStoreName<TSchema>>(name: TStoreName): DatabaseObjectStore<TSchema, TStoreName, TMode> =>
    wrapObjectStore<TSchema, TStoreName, TMode>(transaction.objectStore(name));
