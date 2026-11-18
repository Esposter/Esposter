import type { ScopeTopic } from "#src/models/realtime/Topic";

// The scope topic of the rows whose scope column holds a value. The value is already what the topic names, so a secret
// Arrives as its digest
export const getScopeTopic = (tableName: string, column: string, value: string): ScopeTopic =>
  `${tableName}:${column}=${value}`;
