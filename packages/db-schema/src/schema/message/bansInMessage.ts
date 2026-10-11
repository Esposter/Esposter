import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomUserColumns } from "#src/schema/message/roomUserColumns";
import { primaryKey, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const bansInMessage = pgTable(
  "bans",
  {
    // The audit record outlives the moderator's account: their row going nulls this rather than taking the ban
    bannedByUserId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
    ...roomUserColumns,
  },
  { extraConfig: ({ roomId, userId }) => [primaryKey({ columns: [roomId, userId] })], schema: messageSchema },
);

export type BanInMessage = typeof bansInMessage.$inferSelect;

export const selectBanInMessageSchema = createSelectSchema(bansInMessage);
