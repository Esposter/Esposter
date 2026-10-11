import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

export interface DatabaseObjectStoreWriter<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
> {
  delete: (query: IDBKeyRange | TSchema[TStoreName]["key"]) => Promise<void>;
  put: (value: TSchema[TStoreName]["value"], key?: TSchema[TStoreName]["key"]) => Promise<TSchema[TStoreName]["key"]>;
}
