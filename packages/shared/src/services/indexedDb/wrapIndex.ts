import type { DatabaseIndex } from "#src/models/indexedDb/DatabaseIndex";
import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

import { requestToPromise } from "#src/services/indexedDb/requestToPromise";

export const wrapIndex = <
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TIndexName extends DatabaseIndexName<TSchema, TStoreName>,
>(
  index: IDBIndex,
): DatabaseIndex<TSchema, TStoreName, TIndexName> => ({
  getAll: (query, count) => requestToPromise(index.getAll(query, count)),
  getAllKeys: (query, count) => requestToPromise(index.getAllKeys(query, count)),
});
