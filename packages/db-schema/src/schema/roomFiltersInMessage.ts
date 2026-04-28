import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { text, uuid } from "drizzle-orm/pg-core";

export const roomFiltersInMessage = pgTable(
  "roomFilters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("roomId")
      .notNull()
      .unique()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    words: text("words").array().notNull().default([]),
  },
  {
    schema: messageSchema,
  },
);

export type RoomFilterInMessage = typeof roomFiltersInMessage.$inferSelect;
