import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, primaryKey, text } from "drizzle-orm/pg-core";

export const blocks = pgTable(
  "blocks",
  {
    blockedId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockerId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ blockedId, blockerId }) => [
      primaryKey({ columns: [blockerId, blockedId] }),
      check("blocks_blockerId_blockedId_check", sql`${blockerId} != ${blockedId}`),
      index("blocks_blockedId_index").on(blockedId),
    ],
  },
);

export type Block = typeof blocks.$inferSelect;
