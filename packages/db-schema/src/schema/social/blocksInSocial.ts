import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { socialSchema } from "#src/schema/social/socialSchema";
import { sql } from "drizzle-orm";
import { check, index, primaryKey, text } from "drizzle-orm/pg-core";

export const blocksInSocial = pgTable(
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
      check("blocks_blockerId_blockedId_check", sql`${blockerId} != ${blockedId}`),
      index("blocks_blockedId_index").on(blockedId),
    ],
    schema: socialSchema,
  },
);

export type BlockInSocial = typeof blocksInSocial.$inferSelect;
