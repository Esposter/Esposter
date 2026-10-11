import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";

// The one-request shortcuts each run in their own transaction, so a single call is atomic and nothing else is
export interface Database<TSchema extends DatabaseSchema = DatabaseSchema> {
  close: () => void;
  delete: <TStoreName extends DatabaseStoreName<TSchema>>(
    storeName: TStoreName,
    query: IDBKeyRange | TSchema[TStoreName]["key"],
  ) => Promise<void>;
  get: <TStoreName extends DatabaseStoreName<TSchema>>(
    storeName: TStoreName,
    key: TSchema[TStoreName]["key"],
  ) => Promise<TSchema[TStoreName]["value"] | undefined>;
  getAll: <TStoreName extends DatabaseStoreName<TSchema>>(
    storeName: TStoreName,
    query?: IDBKeyRange | TSchema[TStoreName]["key"] | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["value"][]>;
  getAllKeys: <TStoreName extends DatabaseStoreName<TSchema>>(
    storeName: TStoreName,
    query?: IDBKeyRange | TSchema[TStoreName]["key"] | null,
    count?: number,
  ) => Promise<TSchema[TStoreName]["key"][]>;
  readonly name: string;
  put: <TStoreName extends DatabaseStoreName<TSchema>>(
    storeName: TStoreName,
    value: TSchema[TStoreName]["value"],
    key?: TSchema[TStoreName]["key"],
  ) => Promise<TSchema[TStoreName]["key"]>;
  transaction: <TStoreName extends DatabaseStoreName<TSchema>, TMode extends IDBTransactionMode = "readonly">(
    storeNames: TStoreName | readonly TStoreName[],
    mode?: TMode,
    options?: IDBTransactionOptions,
  ) => DatabaseTransaction<TSchema, TStoreName, TMode>;
}
