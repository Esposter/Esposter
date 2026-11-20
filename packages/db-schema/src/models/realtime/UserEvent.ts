import { userAchievementInAchievementWithRelationsSchema } from "#src/models/achievement/UserAchievementInAchievementWithRelations";
import { updateRoomInputSchema } from "#src/models/message/UpdateRoomInput";
import { RealtimeEventType } from "#src/models/realtime/RealtimeEventType";
import { topicSchema } from "#src/models/realtime/Topic";
import { sessionIdSchema } from "#src/models/shared/SessionId";
import { publicUserSchema } from "#src/models/user/PublicUser";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { selectUserToRoomInMessageSchema } from "#src/schema/message/usersToRoomsInMessage";
import { AchievementName } from "#src/services/achievement/AchievementName";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The events a person's own socket carries, one frame each, for every tab the person has open. A payload is what the
// Emitter named, without the device that caused it, and a room-list event names the room it concerns by its id
const updateAchievementEventSchema = z.object({
  data: createUniqueArraySchema(userAchievementInAchievementWithRelationsSchema, "achievementId").max(
    Object.values(AchievementName).length,
  ),
  type: z.literal(RealtimeEventType.UpdateAchievement),
});
// A start took the lease, so the session the person's save held before is replaced by the one named here
const replaceSessionEventSchema = z.object({
  data: z.object({ sessionId: sessionIdSchema.shape.sessionId }),
  type: z.literal(RealtimeEventType.ReplaceSession),
});
// The owner's user row as the counter last wrote it, at the version that write left it. The meter applies it as a row, so a
// Total that arrives after a newer one for the same row loses to it
const updateUsageEventSchema = z.object({
  data: selectUserInAuthSchema,
  type: z.literal(RealtimeEventType.UpdateUsage),
});
// The fields a room edit changes, and the owner a group's departing owner hands it to
const updateRoomEventSchema = z.object({
  data: updateRoomInputSchema.extend({ userId: selectRoomInMessageSchema.shape.userId.optional() }),
  type: z.literal(RealtimeEventType.UpdateRoom),
});
// A room's last message moved it to the top of the list, which is what the room list sorts by. Its own event, since a
// Room update names only the fields a room edit changes
const roomActivityEventSchema = z.object({
  data: z.object({ id: selectRoomInMessageSchema.shape.id, lastMessageAt: z.coerce.date() }),
  type: z.literal(RealtimeEventType.RoomActivity),
});
const deleteRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }),
  type: z.literal(RealtimeEventType.DeleteRoom),
});
// A member as the room's list shows one: the person and the display name their membership row holds
const joinRoomEventSchema = z.object({
  data: z.object({
    displayName: selectUserToRoomInMessageSchema.shape.displayName,
    roomId: selectUserToRoomInMessageSchema.shape.roomId,
    user: publicUserSchema,
  }),
  type: z.literal(RealtimeEventType.JoinRoom),
});
const leaveRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }),
  type: z.literal(RealtimeEventType.LeaveRoom),
});
const updateUserToRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema,
  type: z.literal(RealtimeEventType.UpdateUserToRoom),
});
// A topic a tab watches changed, so its queries on that topic refetch. The frame names the topic alone, never data
const invalidateEventSchema = z.object({
  data: z.object({ topic: topicSchema }),
  type: z.literal(RealtimeEventType.Invalidate),
});

const userEventSchemas = [
  updateAchievementEventSchema,
  replaceSessionEventSchema,
  updateUsageEventSchema,
  updateRoomEventSchema,
  roomActivityEventSchema,
  deleteRoomEventSchema,
  joinRoomEventSchema,
  leaveRoomEventSchema,
  updateUserToRoomEventSchema,
  invalidateEventSchema,
] as const;

export type UserEvent = z.infer<(typeof userEventSchemas)[number]>;

export const userEventSchema = z.discriminatedUnion("type", userEventSchemas) satisfies z.ZodType<UserEvent>;
