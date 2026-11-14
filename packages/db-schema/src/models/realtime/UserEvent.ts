import { AchievementName } from "#src/services/achievement/AchievementName";
import { friendRequestInSocialWithRelationsSchema } from "#src/models/social/FriendRequestInSocialWithRelations";
import { publicUserSchema } from "#src/models/user/PublicUser";
import { selectFriendInSocialSchema } from "#src/schema/social/friendsInSocial";
import { selectFriendRequestInSocialSchema } from "#src/schema/social/friendRequestsInSocial";
import { selectResourceInResourceSchema } from "#src/schema/resource/resourcesInResource";
import { selectUserToRoomInMessageSchema } from "#src/schema/message/usersToRoomsInMessage";
import { sessionIdSchema } from "#src/models/shared/SessionId";
import { userAchievementInAchievementWithRelationsSchema } from "#src/models/achievement/UserAchievementInAchievementWithRelations";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
import { createApiKeyInputSchema } from "#src/models/user/CreateApiKeyInput";
import { updateRoomInputSchema } from "#src/models/message/UpdateRoomInput";
import { storageUsageSchema } from "#src/models/storage/StorageUsage";

// The events a person's own socket carries, one frame each, for every tab the person has open. A payload is what the
// Emitter named, without the device that caused it, and a room-list event names the room it concerns by its id
const updateAchievementEventSchema = z.object({
  data: createUniqueArraySchema(userAchievementInAchievementWithRelationsSchema, "achievementId").max(
    Object.values(AchievementName).length,
  ),
  type: z.literal("updateAchievement"),
});
const sendFriendRequestEventSchema = z.object({
  data: friendRequestInSocialWithRelationsSchema,
  type: z.literal("sendFriendRequest"),
});
const acceptFriendRequestEventSchema = z.object({
  data: z.object({ receiverUser: publicUserSchema, senderUser: publicUserSchema }),
  type: z.literal("acceptFriendRequest"),
});
const declineFriendRequestEventSchema = z.object({
  data: selectFriendRequestInSocialSchema.pick({ receiverId: true, senderId: true }),
  type: z.literal("declineFriendRequest"),
});
const deleteFriendEventSchema = z.object({
  data: selectFriendInSocialSchema.pick({ receiverId: true, senderId: true }),
  type: z.literal("deleteFriend"),
});
// A start took the lease, so the session the person's save held before is replaced by the one named here
const replaceSessionEventSchema = z.object({
  data: z.object({ sessionId: sessionIdSchema.shape.sessionId }),
  type: z.literal("replaceSession"),
});
const updateUsageEventSchema = z.object({ data: storageUsageSchema, type: z.literal("updateUsage") });
// The content is not carried: a subscriber re-reads it through the type's own read, so a large document crosses by
// The same path as any read rather than over the socket
const saveResourceContentEventSchema = z.object({
  data: z.object({
    apiKeyName: createApiKeyInputSchema.shape.name,
    contentVersion: selectResourceInResourceSchema.shape.contentVersion,
    id: selectResourceInResourceSchema.shape.id,
  }),
  type: z.literal("saveResourceContent"),
});
const updateRoomEventSchema = z.object({ data: updateRoomInputSchema, type: z.literal("updateRoom") });
const deleteRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }),
  type: z.literal("deleteRoom"),
});
const joinRoomEventSchema = z.object({
  data: z.object({ roomId: selectUserToRoomInMessageSchema.shape.roomId, user: publicUserSchema }),
  type: z.literal("joinRoom"),
});
const leaveRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }),
  type: z.literal("leaveRoom"),
});
const updateUserToRoomEventSchema = z.object({
  data: selectUserToRoomInMessageSchema,
  type: z.literal("updateUserToRoom"),
});

const userEventSchemas = [
  updateAchievementEventSchema,
  sendFriendRequestEventSchema,
  acceptFriendRequestEventSchema,
  declineFriendRequestEventSchema,
  deleteFriendEventSchema,
  replaceSessionEventSchema,
  updateUsageEventSchema,
  saveResourceContentEventSchema,
  updateRoomEventSchema,
  deleteRoomEventSchema,
  joinRoomEventSchema,
  leaveRoomEventSchema,
  updateUserToRoomEventSchema,
] as const;

export type UserEvent = z.infer<(typeof userEventSchemas)[number]>;

export const userEventSchema = z.discriminatedUnion("type", userEventSchemas) satisfies z.ZodType<UserEvent>;
