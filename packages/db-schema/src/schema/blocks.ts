import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, primaryKey, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const blocks = pgTable(
  "blocks",
  {
    blockedId: text("blockedId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockerId: text("blockerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ blockedId, blockerId }) => [
      primaryKey({ columns: [blockerId, blockedId] }),
      check("no_self_block", sql`${blockerId} != ${blockedId}`),
      index("blocks_blockedId_index").on(blockedId),
    ],
  },
);

export type Block = typeof blocks.$inferSelect;

export const selectBlockSchema = createSelectSchema(blocks);
