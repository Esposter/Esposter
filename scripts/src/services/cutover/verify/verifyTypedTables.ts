import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { VerifyTypedTablesOptions } from "#src/models/cutover/VerifyTypedTablesOptions";

import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";
import { InvalidOperationError, Operation } from "@esposter/shared";

const readCountByPartition = async (executor: D1Executor, sql: string): Promise<Map<string, number>> => {
  const rows = await executor.query({ params: [], sql });
  return new Map(rows.map((row) => [String(row.partitionKey), Number(row.count)]));
};

// Counts the typed rows against the entities their mappers keep, partition by partition, so a missing or extra row is found in its partition.
// The messages are not here: each room's object is checked by verifyRoomMessages. Nothing is written: the mappers' ids are never flushed
export const verifyTypedTables = async (options: VerifyTypedTablesOptions): Promise<void> => {
  const { connectionString, executor, idMap } = options;
  const parents = await readTableParents(executor);
  for (const mapper of tableMappers) {
    const expected = new Map<string, number>();
    const tableClient = createTableClient(connectionString, mapper.azureTable);
    for await (const { entity, timestamp } of listMapperEntities(tableClient, mapper.azureTable)) {
      if (mapper.map(entity, { idMap, parents, timestamp }))
        expected.set(entity.partitionKey, (expected.get(entity.partitionKey) ?? 0) + 1);
    }
    const actual = await readCountByPartition(executor, mapper.countByPartitionSql);
    const partitions = new Set([...expected.keys(), ...actual.keys()]);
    for (const partition of partitions) {
      const expectedCount = expected.get(partition) ?? 0;
      const actualCount = actual.get(partition) ?? 0;
      if (expectedCount !== actualCount)
        throw new InvalidOperationError(
          Operation.Read,
          mapper.coreTable,
          `partition ${partition} holds ${actualCount} rows but Azure gives ${expectedCount}`,
        );
    }
  }
};
