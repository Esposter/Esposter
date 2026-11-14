import type { SetNonNullable } from "type-fest";

import type { FriendInSocial } from "#src/schema/social/friendsInSocial";
import type { FriendRequestInSocial } from "#src/schema/social/friendRequestsInSocial";
import type { FriendRequestInSocialWithRelations } from "#src/models/social/FriendRequestInSocialWithRelations";
import type { PublicUser } from "#src/models/user/PublicUser";
import type { ReconcileTodoRemindersInput } from "#src/models/todoReminder/ReconcileTodoRemindersInput";
import type { SentMessageCursor } from "#src/models/realtime/SentMessageCursor";
import type { StorageTier } from "#src/models/user/StorageTier";
import type { UserAchievementInAchievementWithRelations } from "#src/models/achievement/UserAchievementInAchievementWithRelations";
import type { UserEvent } from "#src/models/realtime/UserEvent";
import type { UserStatusInMessage } from "#src/schema/message/userStatusesInMessage";
import type { UserToRoomInMessage } from "#src/schema/message/usersToRoomsInMessage";

// A reminder a person set for themselves, held until its alarm sends it. Its deep link is the room it was set in
export interface ScheduledReminder {
  id: string;
  roomId: string;
  runAt: Date;
  text: string;
}

// The RPC surface of a User object, the one contract its class in the functions Worker and the web Worker's callers share.
// A personal event is sent by the write that raised it, and reaches every tab the person has open
export interface UserObjectRpc {
  // A room-list event, sent to every tab the person has open
  broadcastEvent(event: UserEvent): Promise<void>;
  acceptFriendRequest(input: { receiverUser: PublicUser; senderUser: PublicUser }): Promise<void>;
  addReminder(reminder: ScheduledReminder): Promise<void>;
  addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void>;
  addSentMessage(sentMessage: { createdAt: Date; messageId: number; roomId: string }): Promise<void>;
  closeSession(sessionId: string): Promise<void>;
  declineFriendRequest(input: Pick<FriendRequestInSocial, "receiverId" | "senderId">): Promise<void>;
  deleteFriend(input: Pick<FriendInSocial, "receiverId" | "senderId">): Promise<void>;
  reconcileTodoReminders(input: ReconcileTodoRemindersInput): Promise<void>;
  // A room a member can see moved to the top of their list, which every tab of theirs hears of
  roomActivity(roomId: string, updatedAt: Date): void;
  readReminders(): Promise<ScheduledReminder[]>;
  readScheduledMessages(): Promise<{ roomId: string; runAt: Date; scheduledId: string }[]>;
  readSentMessages(input: {
    before?: SentMessageCursor;
    limit: number;
  }): Promise<{ createdAt: Date; messageId: number; roomId: string }[]>;
  // Whether a reminder was there to remove, so a cancel of one that already fired or never existed is told so
  removeReminder(id: string): Promise<boolean>;
  removeScheduledMessage(scheduledId: string): Promise<void>;
  removeSentMessage(input: { messageId: number; roomId: string }): Promise<void>;
  replaceSession(sessionId: string): Promise<void>;
  saveResourceContent(
    content: { apiKeyName: string; contentVersion: number; id: string },
    deviceId: string,
  ): Promise<void>;
  sendFriendRequest(friendRequest: FriendRequestInSocialWithRelations): Promise<void>;
  updateAchievement(userAchievements: UserAchievementInAchievementWithRelations[]): Promise<void>;
  updateUsage(storageUsage: { bytesUsed: number; quotaBytes: number; tier: StorageTier }): Promise<void>;
  updateUserToRoom(userToRoom: UserToRoomInMessage): Promise<void>;
  upsertStatus(status: SetNonNullable<UserStatusInMessage, "status">): Promise<void>;
}
