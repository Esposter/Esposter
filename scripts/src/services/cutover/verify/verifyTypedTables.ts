import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { VerifyTypedTablesOptions } from "#src/models/cutover/VerifyTypedTablesOptions";

import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { MESSAGES_SEARCH_TABLE_NAME } from "#src/services/cutover/constants";
import { createIdMap } from "#src/services/cutover/tables/createIdMap";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";
import { messagesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getTableName } from "drizzle-orm";

const readCount = async (executor: D1Executor, sql: string): Promise<number> => {
  const [row] = await executor.query({ params: [], sql });
  return Number(row?.count ?? 0);
};

const readCountByRoom = async (executor: D1Executor, sql: string): Promise<Map<string, number>> => {
  const rows = await executor.query({ params: [], sql });
  return new Map(rows.map((row) => [String(row.partitionKey), Number(row.count)]));
};

// Counts the typed rows against the entities their mappers keep, partition by partition, so a missing or extra row is found in its partition. The
// search table must then hold one row per message. Nothing is written: the mappers' ids are never flushed
export const verifyTypedTables = async (options: VerifyTypedTablesOptions): Promise<void> => {
  const { archiveBucket, client, connectionString, executor } = options;
  const parents = await readTableParents(executor);
  const idMap = await createIdMap(
    client,
    archiveBucket,
    tableMappers.map(({ azureTable }) => azureTable),
  );
  for (const mapper of tableMappers) {
    const expected = new Map<string, number>();
    const tableClient = createTableClient(connectionString, mapper.azureTable);
    for await (const { entity, timestamp } of listMapperEntities(tableClient, mapper.azureTable)) {
      if (mapper.map(entity, { idMap, parents, timestamp }))
        expected.set(entity.partitionKey, (expected.get(entity.partitionKey) ?? 0) + 1);
    }
    const actual = await readCountByRoom(executor, mapper.countByPartitionSql);
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

  const messageCount = await readCount(
    executor,
    `SELECT COUNT(*) AS "count" FROM "${getTableName(messagesInMessage)}"`,
  );
  const searchCount = await readCount(executor, `SELECT COUNT(*) AS "count" FROM "${MESSAGES_SEARCH_TABLE_NAME}"`);
  if (searchCount !== messageCount)
    throw new InvalidOperationError(
      Operation.Read,
      MESSAGES_SEARCH_TABLE_NAME,
      `holds ${searchCount} rows for ${messageCount} messages`,
    );
};
