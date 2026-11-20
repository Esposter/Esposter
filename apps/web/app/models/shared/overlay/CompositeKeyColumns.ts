// The composite primary keys the overlay's tables declare in their extra configuration, by table name, each listing its
// Columns in the order its primaryKey does. Drizzle's table type does not carry a key declared there, so the typed key
// Of such a table is named here once. The runtime key reads the same columns from the table's configuration
export interface CompositeKeyColumns {
  bans: readonly ["roomId", "userId"];
  blocks: readonly ["blockerId", "blockedId"];
  bookmarks: readonly ["userId", "path"];
  resourceFavorites: readonly ["userId", "resourceId"];
  threadFollows: readonly ["roomId", "threadRootId", "userId"];
}
