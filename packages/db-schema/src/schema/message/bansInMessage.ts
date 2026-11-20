import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sqliteTable } from "#src/sqliteTable";
import { primaryKey, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const bansInMessage = sqliteTable(
  "bans",
  {
    // The audit record outlives the moderator's account: their row going nulls this rather than taking the ban
    bannedByUserId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
    ...createRoomUserColumns(),
  },
  {
    extraConfig: ({ deletedAt, roomId, userId }) => [
      primaryKey({ columns: [roomId, userId] }),
      createTombstoneIndex("bans", deletedAt),
    ],
    schema: messageSchema,
    scope: { columns: ["userId", "roomId"] },
  },
);

export type BanInMessage = typeof bansInMessage.$inferSelect;

export const selectBanInMessageSchema = createSelectSchema(bansInMessage, { roomId: () => z.uuidv7() });
