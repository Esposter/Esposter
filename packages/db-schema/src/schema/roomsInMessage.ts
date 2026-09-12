import { MimeCategory, mimeCategorySchema } from "#src/models/file/MimeCategory";
import { RoomType, roomTypeSchema } from "#src/models/message/RoomType";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomCategoriesInMessage } from "#src/schema/roomCategoriesInMessage";
import { users } from "#src/schema/users";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNormalizedStringSchema, createUniqueArraySchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const ROOM_NAME_MAX_LENGTH = 100;
export const ROOM_TOPIC_MAX_LENGTH = 500;

export const roomTypeEnum = pgEnum("roomType", RoomType);

export const mimeCategoryEnum = pgEnum("mimeCategory", MimeCategory);

export const roomsInMessage = pgTable(
  "rooms",
  {
    // Attachment categories members may upload to this room — defaults to every category (no restriction).
    allowedMimeCategories: mimeCategoryEnum()
      .array()
      .notNull()
      .default([MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video]),
    categoryId: uuid().references(() => roomCategoriesInMessage.id, { onDelete: "set null" }),
    id: uuid().primaryKey().defaultRandom(),
    image: text().notNull().default(""),
    // Closes the room to every existing invite link at once, without deleting any of them — the control for a
    // Raid in progress, which the links have to survive.
    isInvitePaused: boolean().notNull().default(false),
    isReadOnly: boolean().notNull().default(false),
    // Per-room attachment size cap in bytes — null falls back to the global MAX_FILE_REQUEST_SIZE.
    maxFileSizeBytes: integer(),
    name: text().notNull().default(""),
    participantKey: text().unique(),
    slowmodeMs: integer(),
    topic: text().notNull().default(""),
    type: roomTypeEnum().notNull().default(RoomType.Room),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ maxFileSizeBytes, name, participantKey, slowmodeMs, topic, type }) => [
      check(
        "rooms_name_check",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND LENGTH(TRIM(${name})) = 0) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${createNameCheckSql(name, ROOM_NAME_MAX_LENGTH)})`,
      ),
      check(
        "rooms_type_participantKey_check",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${participantKey} IS NOT NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${participantKey} IS NULL)`,
      ),
      check(
        "rooms_maxFileSizeBytes_check",
        sql`${maxFileSizeBytes} IS NULL OR ${createMinimumCheckSql(maxFileSizeBytes, 1)}`,
      ),
      check("rooms_slowmodeMs_check", sql`${slowmodeMs} IS NULL OR ${createMinimumCheckSql(slowmodeMs, 1)}`),
      check("rooms_topic_length_check", createMaxLengthCheckSql(topic, ROOM_TOPIC_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type RoomInMessage = typeof roomsInMessage.$inferSelect;

export const selectRoomInMessageSchema = createSelectSchema(roomsInMessage, {
  allowedMimeCategories: createUniqueArraySchema(mimeCategorySchema),
  maxFileSizeBytes: (schema) => schema.min(1),
  name: (schema) => createNormalizedStringSchema(ROOM_NAME_MAX_LENGTH, schema),
  slowmodeMs: (schema) => schema.min(1),
  topic: (schema) => createNormalizedStringSchema(ROOM_TOPIC_MAX_LENGTH, schema),
  type: roomTypeSchema,
});
