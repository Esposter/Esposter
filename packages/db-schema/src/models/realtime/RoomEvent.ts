import { z } from "zod";
import { deleteEmojiInputSchema } from "#src/models/message/metadata/DeleteEmojiInput";
import { messageEmojiMetadataEntitySchema } from "#src/models/message/metadata/MessageEmojiMetadataEntity";
import { updateEmojiInputSchema } from "#src/models/message/metadata/UpdateEmojiInput";
import { deleteMessageInputSchema } from "#src/models/message/DeleteMessageInput";
import { updateMessageInputSchema } from "#src/models/message/UpdateMessageInput";
import { revokeRoleInputSchema } from "#src/models/message/RevokeRoleInput";
import { timeoutUserAdminActionInputSchema } from "#src/models/message/TimeoutUserAdminActionInput";
import { roomEmojiWithSasUrlSchema } from "#src/models/message/emoji/RoomEmojiWithSasUrl";
import { typingSchema } from "#src/models/message/Typing";
import { MEMBER_PERMISSION_BIGINT_REGEX, MESSAGE_BATCH_MAX_LENGTH } from "#src/services/message/constants";
import { adminActionTypeSchema } from "#src/models/message/AdminActionType";
import { messageEntitySchema } from "#src/models/message/MessageEntity";
import { selectRoomEmojiInMessageSchema } from "#src/schema/message/roomEmojisInMessage";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { selectRoomRoleInMessageSchema } from "#src/schema/message/roomRolesInMessage";
import { selectUserStatusInMessageSchema } from "#src/schema/message/userStatusesInMessage";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { userIdSchema } from "#src/models/shared/UserId";

// The events a room's socket carries, one frame each. A payload is what the emitter named, without the device that
// Caused it: the object skips that socket itself, and the wire never names a session
const createMessageEventSchema = z.object({
  data: z.array(messageEntitySchema).max(MESSAGE_BATCH_MAX_LENGTH),
  type: z.literal("createMessage"),
});
const createTypingEventSchema = z.object({ data: typingSchema, type: z.literal("createTyping") });
const deleteMessageEventSchema = z.object({ data: deleteMessageInputSchema, type: z.literal("deleteMessage") });
// The link preview is generated on the server and kept off the wire, as it is off the message's schema
const updateMessageEventSchema = z.object({
  data: z
    .object({
      ...updateMessageInputSchema.shape,
      ...standardMessageEntitySchema.pick({ files: true, isEdited: true, isPinned: true }).shape,
    })
    .partial({ files: true, message: true }),
  type: z.literal("updateMessage"),
});
const createEmojiEventSchema = z.object({ data: messageEmojiMetadataEntitySchema, type: z.literal("createEmoji") });
const updateEmojiEventSchema = z.object({
  data: z.object({
    ...messageEmojiMetadataEntitySchema.pick({ messageRowKey: true, userIds: true }).shape,
    ...updateEmojiInputSchema.shape,
  }),
  type: z.literal("updateEmoji"),
});
const deleteEmojiEventSchema = z.object({ data: deleteEmojiInputSchema, type: z.literal("deleteEmoji") });
const createRoomEmojiEventSchema = z.object({ data: roomEmojiWithSasUrlSchema, type: z.literal("createRoomEmoji") });
const updateRoomEmojiEventSchema = z.object({
  data: selectRoomEmojiInMessageSchema,
  type: z.literal("updateRoomEmoji"),
});
const deleteRoomEmojiEventSchema = z.object({
  data: selectRoomEmojiInMessageSchema.pick({ id: true, roomId: true }),
  type: z.literal("deleteRoomEmoji"),
});
const assignRoleEventSchema = z.object({
  data: z.object({ ...selectRoomRoleInMessageSchema.shape, ...userIdSchema.shape }),
  type: z.literal("assignRole"),
});
const createRoleEventSchema = z.object({ data: selectRoomRoleInMessageSchema, type: z.literal("createRole") });
const deleteRoleEventSchema = z.object({
  data: selectRoomRoleInMessageSchema.pick({ id: true, roomId: true }),
  type: z.literal("deleteRole"),
});
const revokeRoleEventSchema = z.object({ data: revokeRoleInputSchema, type: z.literal("revokeRole") });
const updateRoleEventSchema = z.object({ data: selectRoomRoleInMessageSchema, type: z.literal("updateRole") });
// A permission bitfield is a bigint, which JSON cannot carry, so it rides as its decimal digits
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
const upsertStatusEventSchema = z.object({
  data: z.object({
    ...selectUserStatusInMessageSchema.shape,
    status: selectUserStatusInMessageSchema.shape.status.unwrap(),
  }),
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
