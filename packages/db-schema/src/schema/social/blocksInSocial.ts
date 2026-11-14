import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { socialSchema } from "#src/schema/social/socialSchema";
import { createDistinctCheckSql } from "#src/services/shared/createDistinctCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, index, primaryKey, text } from "drizzle-orm/sqlite-core";

export const blocksInSocial = sqliteTable(
  "blocks",
  {
    blockedId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    blockerId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ blockedId, blockerId }) => [
      primaryKey({ columns: [blockerId, blockedId] }),
      check("blocks_blockerId_blockedId_check", createDistinctCheckSql(blockerId, blockedId)),
      index("blocks_blockedId_index").on(blockedId),
    ],
    schema: socialSchema,
  },
);

export type BlockInSocial = typeof blocksInSocial.$inferSelect;
