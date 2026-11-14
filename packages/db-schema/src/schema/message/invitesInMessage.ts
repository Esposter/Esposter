import { messageSchema } from "#src/schema/message/messageSchema";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
import { createExactLengthCheckSql } from "#src/services/shared/createExactLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { SECRET_TOKEN_LENGTH, secretTokenSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const invitesInMessage = sqliteTable(
  "invites",
  {
    // Null = never expires (timestamps have no empty value, unlike numbers/strings)
    expiresAt: integer({ mode: "timestamp_ms" }),
    // The code a link carries: a 256-bit secret from `generateSecretToken`. An invite is shared rather than held, so the
    // Code must be unguessable, and the room's admins read it back to share it
    id: text().primaryKey(),
    // 0 = unlimited uses — the numeric empty sentinel, stored as-is so it propagates end-to-end
    maxUses: integer().notNull().default(0),
    ...createRoomUserColumns(),
    uses: integer().notNull().default(0),
  },
  {
    extraConfig: ({ id, maxUses, roomId, uses }) => [
      check("invites_id_length_check", createExactLengthCheckSql(id, SECRET_TOKEN_LENGTH)),
      check("invites_maxUses_check", createMinimumCheckSql(maxUses, 0)),
      check("invites_uses_check", createMinimumCheckSql(uses, 0)),
      check("invites_uses_maxUses_check", sql`${maxUses} = 0 OR ${uses} <= ${maxUses}`),
      // A room's invite list pages by room, and its deletion cascades through it
      index("invites_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type InviteInMessage = typeof invitesInMessage.$inferSelect;

export const selectInviteInMessageSchema = createSelectSchema(invitesInMessage, {
  id: () => secretTokenSchema,
  roomId: () => z.uuidv7(),
});
