import type { IdMapEntry } from "#src/models/cutover/IdMapEntry";
import type { StreamTable } from "@esposter/db-schema";

// The id each Azure entity was given in D1, keyed by its table and keys. Its entries are kept in the archive bucket as segments,
// so a re-run and the delta give an entity the id it already has
export interface IdMap {
  // The id an entity was given, a new random v4 when it has none. Nothing is stored until `flush`
  assign: (azureTable: StreamTable, partitionKey: string, rowKey: string) => string;
  entries: (azureTable: StreamTable) => IdMapEntry[];
  // Stores the entries given since the last flush of this table as its next segment, before the rows that use them are written
  flush: (azureTable: StreamTable) => Promise<void>;
  get: (azureTable: StreamTable, partitionKey: string, rowKey: string) => string | undefined;
}
