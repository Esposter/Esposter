import type { ScopeTopic } from "#src/models/realtime/Topic";

// The scope topic of every row of a table, which a write publishes and a read of the whole table watches
export const getTableTopic = (tableName: string): ScopeTopic => `${tableName}:*`;
