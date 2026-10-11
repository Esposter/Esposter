import type { DatabaseIndexCreator } from "#src/models/indexedDb/DatabaseIndexCreator";
import type { DatabaseObjectStoreReader } from "#src/models/indexedDb/DatabaseObjectStoreReader";
import type { DatabaseObjectStoreWriter } from "#src/models/indexedDb/DatabaseObjectStoreWriter";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

// Mode-gated like the native store: a readonly store has no write methods, so passing one where a writable store is
// Expected is a type error, and only an upgrade store can create an index
export type DatabaseObjectStore<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
  TMode extends IDBTransactionMode,
> = DatabaseObjectStoreReader<TSchema, TStoreName> &
  (TMode extends "readonly"
    ? unknown
    : DatabaseObjectStoreWriter<TSchema, TStoreName> &
        (TMode extends "versionchange" ? DatabaseIndexCreator<TSchema, TStoreName> : unknown));
