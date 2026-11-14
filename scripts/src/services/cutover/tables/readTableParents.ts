import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { TableParents } from "#src/models/cutover/TableParents";

import { appUsersInMessage, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// The ids of one table, read once so each entity's parent is checked without a query of its own
const readIds = async (executor: D1Executor, tableName: string): Promise<Set<string>> => {
  const rows = await executor.query({ params: [], sql: `SELECT "id" FROM "${tableName}"` });
  return new Set(rows.map(({ id }) => String(id)));
};

export const readTableParents = async (executor: D1Executor): Promise<TableParents> => ({
  appUserIds: await readIds(executor, getTableName(appUsersInMessage)),
  roomIds: await readIds(executor, getTableName(roomsInMessage)),
  userIds: await readIds(executor, getTableName(usersInAuth)),
});
