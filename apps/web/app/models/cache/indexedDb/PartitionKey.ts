import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { DatabaseIndexKey, DatabaseIndexName } from "@esposter/shared";

// The schema types every index key as a string, which is what lets a partition double as a `useMutation` target
// Verbatim. The conditional cannot resolve while the store stays generic, so the intersection restates the
// Guarantee the schema already makes
export type PartitionKey<
  TStore extends IndexedDbStoreName,
  TIndex extends DatabaseIndexName<IndexedDbDatabaseSchema, TStore>,
> = DatabaseIndexKey<IndexedDbDatabaseSchema, TStore, TIndex> & string;
