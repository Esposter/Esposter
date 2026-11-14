import type { IdMap } from "#src/models/cutover/IdMap";
import type { IdMapEntry } from "#src/models/cutover/IdMapEntry";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { StreamTable } from "@esposter/db-schema";

import { idMapEntrySchema } from "#src/models/cutover/IdMapEntry";
import { getIdMapKey } from "#src/services/cutover/tables/getIdMapKey";
import { getIdMapSegmentKey } from "#src/services/cutover/tables/getIdMapSegmentKey";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const idMapSegmentSchema = z.array(idMapEntrySchema);

// Loads every segment the archive holds for the tables, in order, into the map they make. An entity given no id yet gets a random
// v4, the form the app validates, so a row is never given a derived one. A new entry waits in memory until `flush` writes the
// table's next segment, which the copy does before it writes the rows that carry those ids
export const createIdMap = async (client: R2Client, archiveBucket: string, azureTables: StreamTable[]): Promise<IdMap> => {
  const entryByKey = new Map<string, IdMapEntry>();
  const entriesByTable = new Map<StreamTable, IdMapEntry[]>();
  const flushedCountByTable = new Map<StreamTable, number>();
  const segmentCountByTable = new Map<StreamTable, number>();

  for (const azureTable of azureTables) {
    const loaded: IdMapEntry[] = [];
    let index = 0;
    for (;;) {
      // oxlint-disable-next-line no-await-in-loop -- segments load in order, each named by the count of the ones before it
      const text = await client.getText(archiveBucket, getIdMapSegmentKey(azureTable, index));
      if (text === undefined) break;
      loaded.push(...idMapSegmentSchema.parse(parseMachineJson(text)));
      index += 1;
    }
    for (const entry of loaded) entryByKey.set(getIdMapKey(azureTable, entry.partitionKey, entry.rowKey), entry);
    entriesByTable.set(azureTable, loaded);
    flushedCountByTable.set(azureTable, loaded.length);
    segmentCountByTable.set(azureTable, index);
  }

  const getTableEntries = (azureTable: StreamTable): IdMapEntry[] => {
    const entries = entriesByTable.get(azureTable);
    if (!entries) throw new InvalidOperationError(Operation.Read, azureTable, "has no id map loaded");
    return entries;
  };

  return {
    assign: (azureTable, partitionKey, rowKey) => {
      const key = getIdMapKey(azureTable, partitionKey, rowKey);
      const existing = entryByKey.get(key);
      if (existing) return existing.id;
      const entry: IdMapEntry = { id: crypto.randomUUID(), partitionKey, rowKey };
      entryByKey.set(key, entry);
      getTableEntries(azureTable).push(entry);
      return entry.id;
    },
    entries: (azureTable) => [...getTableEntries(azureTable)],
    flush: async (azureTable) => {
      const entries = getTableEntries(azureTable);
      const flushedCount = flushedCountByTable.get(azureTable) ?? 0;
      if (entries.length === flushedCount) return;
      const index = segmentCountByTable.get(azureTable) ?? 0;
      await client.putText(archiveBucket, getIdMapSegmentKey(azureTable, index), JSON.stringify(entries.slice(flushedCount)));
      flushedCountByTable.set(azureTable, entries.length);
      segmentCountByTable.set(azureTable, index + 1);
    },
    get: (azureTable, partitionKey, rowKey) => entryByKey.get(getIdMapKey(azureTable, partitionKey, rowKey))?.id,
  };
};
