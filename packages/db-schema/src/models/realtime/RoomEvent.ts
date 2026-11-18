import { adminActionTypeSchema } from "#src/models/message/AdminActionType";
import { timeoutUserAdminActionInputSchema } from "#src/models/message/TimeoutUserAdminActionInput";
import { typingSchema } from "#src/models/message/Typing";
import { roomMessageSchema } from "#src/models/realtime/RoomMessage";
import { roomReactionSchema } from "#src/models/realtime/RoomReaction";
import { userIdSchema } from "#src/models/shared/UserId";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { selectUserStatusInMessageSchema } from "#src/schema/message/userStatusesInMessage";
import { MESSAGE_BATCH_MAX_LENGTH } from "#src/services/message/constants";
import { z } from "zod";

// The events a room's socket carries, one frame each. A payload is what the object sent, without the device that caused
// It: the object skips that socket itself, and the wire never names a session. A message is named by its integer id
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
// A client detects its presence from
const upsertStatusEventSchema = z.object({ data: selectUserStatusInMessageSchema, type: z.literal("upsertStatus") });

const roomEventSchemas = [
  createMessageEventSchema,
  createTypingEventSchema,
  deleteMessageEventSchema,
  updateMessageEventSchema,
  createEmojiEventSchema,
  updateEmojiEventSchema,
  deleteEmojiEventSchema,
  adminActionEventSchema,
  upsertStatusEventSchema,
] as const;

export type RoomEvent = z.infer<(typeof roomEventSchemas)[number]>;

export const roomEventSchema = z.discriminatedUnion("type", roomEventSchemas) satisfies z.ZodType<RoomEvent>;
