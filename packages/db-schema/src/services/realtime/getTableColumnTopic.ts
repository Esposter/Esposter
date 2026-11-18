import type { ScopeTopic } from "#src/models/realtime/Topic";

// The topic of one column of every row of a table. An update publishes the columns it sets, and a table-wide read names each
// Column it reads, so only a read of a column that changed is woken
export const getTableColumnTopic = (tableName: string, columnName: string): ScopeTopic =>
  `${tableName}.${columnName}:*`;
