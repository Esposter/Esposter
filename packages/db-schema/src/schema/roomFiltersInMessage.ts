import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";

export const FILTER_KEY_MAX_LENGTH = 100;
export const FILTER_WORDS_MAX_LENGTH = 1000;

export const roomFiltersInMessage = pgTable(
  "roomFilters",
  {
    id: uuid().primaryKey().defaultRandom(),
    roomId: uuid()
      .notNull()
      .unique()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    words: text().array().notNull().default([]),
  },
  {
    extraConfig: ({ words }) => [
      check(
        "room_filters_words_size_check",
        sql`cardinality(${words}) <= ${sql.raw(FILTER_WORDS_MAX_LENGTH.toString())}`,
      ),
    ],
    schema: messageSchema,
  },
);

export type RoomFilterInMessage = typeof roomFiltersInMessage.$inferSelect;
