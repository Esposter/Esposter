import type { MimeCategory } from "#src/models/file/MimeCategory";

import { MimeCategories, mimeCategorySchema } from "#src/models/file/MimeCategory";
import { RoomType, roomTypeSchema } from "#src/models/message/RoomType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { ROOM_NAME_MAX_LENGTH, ROOM_TOPIC_MAX_LENGTH } from "#src/services/room/constants";
import { URL_MAX_LENGTH } from "#src/services/shared/constants";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { createNormalizedStringSchema, createUniqueArraySchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const roomsInMessage = sqliteTable(
  "rooms",
  {
    // Attachment categories members may upload to this room — every category is no restriction
    allowedMimeCategories: text({ mode: "json" })
      .notNull()
      .$type<MimeCategory[]>()
      .default([...MimeCategories]),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    image: text().notNull().default(""),
    // Closes the room to every existing invite link at once, without deleting any of them — the control for a
    // Raid in progress, which the links have to survive.
    isInvitePaused: integer({ mode: "boolean" }).notNull().default(false),
    isReadOnly: integer({ mode: "boolean" }).notNull().default(false),
    // Per-room attachment size cap in bytes — 0 falls back to the global MAX_FILE_REQUEST_SIZE.
    maxFileSizeBytes: integer().notNull().default(0),
    name: text().notNull().default(""),
    participantKey: text().unique(),
    // 0 is no slowmode
    slowmodeMs: integer().notNull().default(0),
    topic: text().notNull().default(""),
    type: createEnumColumn(RoomType).notNull().default(RoomType.Room),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
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
      check("rooms_maxFileSizeBytes_check", createMinimumCheckSql(maxFileSizeBytes, 0)),
      check("rooms_slowmodeMs_check", createMinimumCheckSql(slowmodeMs, 0)),
      check("rooms_topic_length_check", createMaxLengthCheckSql(topic, ROOM_TOPIC_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type RoomInMessage = typeof roomsInMessage.$inferSelect;

export const selectRoomInMessageSchema = createSelectSchema(roomsInMessage, {
  // Unique over an enum, so the enum's size is the most it can hold
  allowedMimeCategories: createUniqueArraySchema(mimeCategorySchema).max(mimeCategorySchema.options.length),
  id: () => z.uuidv4(),
  image: (schema) => schema.max(URL_MAX_LENGTH),
  maxFileSizeBytes: (schema) => schema.nonnegative(),
  name: (schema) => createNormalizedStringSchema(ROOM_NAME_MAX_LENGTH, schema),
  slowmodeMs: (schema) => schema.nonnegative(),
  topic: (schema) => createNormalizedStringSchema(ROOM_TOPIC_MAX_LENGTH, schema),
  type: roomTypeSchema,
});
