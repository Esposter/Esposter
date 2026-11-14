import { z } from "zod";
import { revokeRoleInputSchema } from "#src/models/message/RevokeRoleInput";
import { timeoutUserAdminActionInputSchema } from "#src/models/message/TimeoutUserAdminActionInput";
import { roomEmojiWithSasUrlSchema } from "#src/models/message/emoji/RoomEmojiWithSasUrl";
import { typingSchema } from "#src/models/message/Typing";
import { MEMBER_PERMISSION_BIGINT_REGEX, MESSAGE_BATCH_MAX_LENGTH } from "#src/services/message/constants";
import { adminActionTypeSchema } from "#src/models/message/AdminActionType";
import { selectRoomEmojiInMessageSchema } from "#src/schema/message/roomEmojisInMessage";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { selectRoomRoleInMessageSchema } from "#src/schema/message/roomRolesInMessage";
import { selectUserStatusInMessageSchema } from "#src/schema/message/userStatusesInMessage";
import { roomMessageSchema } from "#src/models/realtime/RoomMessage";
import { roomReactionSchema } from "#src/models/realtime/RoomReaction";
import { userIdSchema } from "#src/models/shared/UserId";

// The events a room's socket carries, one frame each. A payload is what the object sent, without the device that caused
// it: the object skips that socket itself, and the wire never names a session. A message is named by its integer id
const createMessageEventSchema = z.object({
  data: z.array(roomMessageSchema).max(MESSAGE_BATCH_MAX_LENGTH),
  type: z.literal("createMessage"),
});
const createTypingEventSchema = z.object({ data: typingSchema, type: z.literal("createTyping") });
// A delete carries the tombstone the object left, with its deletedAt set, so a client keeps the message by id as deleted
const deleteMessageEventSchema = z.object({ data: roomMessageSchema, type: z.literal("deleteMessage") });
// A message update carries the whole message as the object now holds it, so a client replaces it by id
const updateMessageEventSchema = z.object({ data: roomMessageSchema, type: z.literal("updateMessage") });
// A reaction is one row, and its update carries the whole row, so a client replaces the reaction it holds by its key
const createEmojiEventSchema = z.object({ data: roomReactionSchema, type: z.literal("createEmoji") });
const updateEmojiEventSchema = z.object({ data: roomReactionSchema, type: z.literal("updateEmoji") });
const deleteEmojiEventSchema = z.object({
  data: roomReactionSchema.pick({ emojiTag: true, messageId: true }),
  type: z.literal("deleteEmoji"),
});
const createRoomEmojiEventSchema = z.object({ data: roomEmojiWithSasUrlSchema, type: z.literal("createRoomEmoji") });
const updateRoomEmojiEventSchema = z.object({
  data: selectRoomEmojiInMessageSchema,
  type: z.literal("updateRoomEmoji"),
});
const deleteRoomEmojiEventSchema = z.object({
  data: selectRoomEmojiInMessageSchema.pick({ id: true, roomId: true }),
  type: z.literal("deleteRoomEmoji"),
});
// A role's permission bitfield is a bigint, which JSON cannot carry, so a role event names it by its decimal digits
const roleEventSchema = selectRoomRoleInMessageSchema.extend({
  permissions: z.string().regex(MEMBER_PERMISSION_BIGINT_REGEX),
});
const assignRoleEventSchema = z.object({
  data: z.object({ ...roleEventSchema.shape, ...userIdSchema.shape }),
  type: z.literal("assignRole"),
});
const createRoleEventSchema = z.object({ data: roleEventSchema, type: z.literal("createRole") });
const deleteRoleEventSchema = z.object({
  data: selectRoomRoleInMessageSchema.pick({ id: true, roomId: true }),
  type: z.literal("deleteRole"),
});
const revokeRoleEventSchema = z.object({ data: revokeRoleInputSchema, type: z.literal("revokeRole") });
const updateRoleEventSchema = z.object({ data: roleEventSchema, type: z.literal("updateRole") });
const updateMemberPermissionOverrideEventSchema = z.object({
  data: z.object({
    allow: z.string().regex(MEMBER_PERMISSION_BIGINT_REGEX),
    deny: z.string().regex(MEMBER_PERMISSION_BIGINT_REGEX),
    roomId: selectRoomInMessageSchema.shape.id,
    userId: userIdSchema.shape.userId,
  }),
  type: z.literal("updateMemberPermissionOverride"),
});
const adminActionEventSchema = z.object({
  data: z.object({
    durationMs: timeoutUserAdminActionInputSchema.shape.durationMs.optional(),
    roomId: selectRoomInMessageSchema.shape.id,
    targetUserId: userIdSchema.shape.userId,
    type: adminActionTypeSchema,
  }),
  type: z.literal("adminAction"),
});
// A member's status row, which a member coming online or going offline also sends: the status it now has is the one
// a client detects its presence from
const upsertStatusEventSchema = z.object({
  data: z.object({ ...selectUserStatusInMessageSchema.shape, expiresAt: z.coerce.date().nullable() }),
  type: z.literal("upsertStatus"),
});

const roomEventSchemas = [
  createMessageEventSchema,
  createTypingEventSchema,
  deleteMessageEventSchema,
  updateMessageEventSchema,
  createEmojiEventSchema,
  updateEmojiEventSchema,
  deleteEmojiEventSchema,
  createRoomEmojiEventSchema,
  updateRoomEmojiEventSchema,
  deleteRoomEmojiEventSchema,
  assignRoleEventSchema,
  createRoleEventSchema,
  deleteRoleEventSchema,
  revokeRoleEventSchema,
  updateRoleEventSchema,
  updateMemberPermissionOverrideEventSchema,
  adminActionEventSchema,
  upsertStatusEventSchema,
] as const;

export type RoomEvent = z.infer<(typeof roomEventSchemas)[number]>;

export const roomEventSchema = z.discriminatedUnion("type", roomEventSchemas) satisfies z.ZodType<RoomEvent>;
