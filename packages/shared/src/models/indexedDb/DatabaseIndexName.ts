import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";

// An index a store declares by name is its literal key. A store name that is a union names the indexes every one of its
// Stores shares, so an index that only some of them declare is never. A store with a string index, the untyped default,
// Takes any name
export type DatabaseIndexName<
  TSchema extends DatabaseSchema,
  TStoreName extends DatabaseStoreName<TSchema>,
> = string extends keyof TSchema[TStoreName]["indexes"] ? string : keyof TSchema[TStoreName]["indexes"] & string;
