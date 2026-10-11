import type { DatabaseObjectStore } from "#src/models/indexedDb/DatabaseObjectStore";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseTransaction<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TMode extends IDBTransactionMode,
> {
  done: Promise<void>;
  objectStore: <TName extends TStoreName>(name: TName) => DatabaseObjectStore<TSchema, TName, TMode>;
}
