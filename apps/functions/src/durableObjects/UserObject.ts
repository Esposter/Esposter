import type {
  FriendInSocial,
  FriendRequestInSocial,
  FriendRequestInSocialWithRelations,
  PublicUser,
  ReconcileTodoRemindersInput,
  SentMessageCursor,
  StorageUsage,
  UserAchievementInAchievementWithRelations,
  UserEvent,
  UserObjectRpc,
  UserToRoomInMessage,
} from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import userMigrations from "#src/durableObjects/user/migrations/migrations";
import { scheduledMessagesInUser, sentMessagesInUser, todoRemindersInUser } from "#src/durableObjects/user/schema";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { TODO_REMINDER_RETRY_DELAY_MS } from "#src/services/todoReminder/constants";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { setUserConnectedInRooms } from "#src/services/user/setUserConnectedInRooms";
import { setUserStatusInRooms } from "#src/services/user/setUserStatusInRooms";
import { getResultAsync, noop } from "@esposter/shared";
import { and, asc, eq, gt, inArray, lt, lte, or, sql } from "drizzle-orm";

// A revoked session's sockets close with code 1008, the policy close a server gives for a credential it no longer accepts
const SESSION_REVOKED_CLOSE_CODE = 1008;

// One User object per person: its SQLite holds the index of the messages they sent, their pending scheduled messages and
// their TodoList reminders, and its one alarm is set to the earliest reminder still ahead, or a retry for one that failed
export class UserObject extends RealtimeObject<UserEvent> implements UserObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, userMigrations.migrations);

  // The first socket brings the person online and the last one to close takes them offline. The count is taken before
  // the base accepts the socket, and that accept runs synchronously inside its fetch, so a concurrent upgrade sees it
  override async fetch(request: Request): Promise<Response> {
    const isFirstSocket = this.ctx.getWebSockets().length === 0;
    const response = await super.fetch(request);
    const identity = readSocketIdentity(request.headers);
    if (isFirstSocket && response.status === 101 && identity) this.reportPresence(identity.userId, true);
    return response;
  }

  override webSocketClose(ws: WebSocket, code: number, reason: string) {
    super.webSocketClose(ws, code, reason);
    const userId = this.ctx.id.name;
    if (userId && this.ctx.getWebSockets().every((socket) => socket === ws)) this.reportPresence(userId, false);
  }

  // A reminder whose send failed is retried this long after the failure. The alarm is re-armed here and in the alarm
  // itself, so a row that stays overdue is never left without one
  override async alarm(): Promise<void> {
    const now = new Date();
    const dueReminders = await this.db
      .select()
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt));
    // Each reminder is removed only once its notification is queued, so a failed send is retried rather than dropped
    for (const reminder of dueReminders) {
      const isSent = await getResultAsync(() => sendTodoReminder(reminder)).match(
        () => true,
        (error) => {
          console.error("TodoReminder failed to send", { error, itemId: reminder.itemId });
          return false;
        },
      );
      if (isSent)
        await this.db
          .delete(todoRemindersInUser)
          .where(
            and(
              eq(todoRemindersInUser.resourceId, reminder.resourceId),
              eq(todoRemindersInUser.itemId, reminder.itemId),
            ),
          );
    }
    await this.armAlarm();
  }

  // A revoked session's sockets close here and no other session's do. Each close runs the base's own close hook, so the
  // presence it ends is reported like any other close
  async closeSession(sessionId: string): Promise<void> {
    for (const ws of this.ctx.getWebSockets(`session:${sessionId}`))
      ws.close(SESSION_REVOKED_CLOSE_CODE, "Session revoked");
  }

  async addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void> {
    await this.db
      .insert(scheduledMessagesInUser)
      .values(scheduledMessage)
      .onConflictDoUpdate({ set: { runAt: scheduledMessage.runAt }, target: scheduledMessagesInUser.scheduledId });
  }

  async addSentMessage(sentMessage: { createdAt: Date; messageId: number; roomId: string }): Promise<void> {
    await this.db.insert(sentMessagesInUser).values(sentMessage).onConflictDoNothing();
  }

  // Ordered newest first, and a page is the rows strictly before the cursor, so a message sent at the same instant to
  // many rooms is neither repeated nor skipped across a page boundary
  async readSentMessages(input: { before?: SentMessageCursor; limit: number }) {
    const { before, limit } = input;
    return this.db
      .select()
      .from(sentMessagesInUser)
      .where(
        before
          ? or(
              lt(sentMessagesInUser.createdAt, before.createdAt),
              and(
                eq(sentMessagesInUser.createdAt, before.createdAt),
                or(
                  lt(sentMessagesInUser.roomId, before.roomId),
                  and(eq(sentMessagesInUser.roomId, before.roomId), lt(sentMessagesInUser.messageId, before.messageId)),
                ),
              ),
            )
          : undefined,
      )
      .orderBy(
        sql`${sentMessagesInUser.createdAt} DESC`,
        sql`${sentMessagesInUser.roomId} DESC`,
        sql`${sentMessagesInUser.messageId} DESC`,
      )
      .limit(limit);
  }

  async readScheduledMessages() {
    return this.db.select().from(scheduledMessagesInUser).orderBy(asc(scheduledMessagesInUser.runAt));
  }

  async reconcileTodoReminders(input: ReconcileTodoRemindersInput): Promise<void> {
    const { cancelledItemIds, reminders, resourceId } = input;
    if (reminders.length > 0)
      await this.db
        .insert(todoRemindersInUser)
        .values(reminders.map(({ dueAt, itemId }) => ({ dueAt, itemId, resourceId })))
        .onConflictDoUpdate({
          set: { dueAt: sql`excluded.dueAt` },
          target: [todoRemindersInUser.resourceId, todoRemindersInUser.itemId],
        });
    if (cancelledItemIds.length > 0)
      await this.db
        .delete(todoRemindersInUser)
        .where(
          and(eq(todoRemindersInUser.resourceId, resourceId), inArray(todoRemindersInUser.itemId, cancelledItemIds)),
        );
    await this.armAlarm();
  }

  roomActivity(roomId: string, updatedAt: Date): void {
    this.broadcast({ data: { id: roomId, updatedAt }, type: "roomActivity" });
  }

  async removeScheduledMessage(scheduledId: string): Promise<void> {
    await this.db.delete(scheduledMessagesInUser).where(eq(scheduledMessagesInUser.scheduledId, scheduledId));
  }

  async removeSentMessage(input: { messageId: number; roomId: string }): Promise<void> {
    await this.db
      .delete(sentMessagesInUser)
      .where(and(eq(sentMessagesInUser.roomId, input.roomId), eq(sentMessagesInUser.messageId, input.messageId)));
  }

  // The person's own events, each to every tab they have open. A save leaves out the tabs of the session that made it,
  // since that session already shows the change
  async acceptFriendRequest(input: { receiverUser: PublicUser; senderUser: PublicUser }): Promise<void> {
    this.broadcast({ data: input, type: "acceptFriendRequest" });
  }

  async declineFriendRequest(input: Pick<FriendRequestInSocial, "receiverId" | "senderId">): Promise<void> {
    this.broadcast({ data: input, type: "declineFriendRequest" });
  }

  async deleteFriend(input: Pick<FriendInSocial, "receiverId" | "senderId">): Promise<void> {
    this.broadcast({ data: input, type: "deleteFriend" });
  }

  async replaceSession(sessionId: string): Promise<void> {
    this.broadcast({ data: { sessionId }, type: "replaceSession" });
  }

  async saveResourceContent(
    content: { apiKeyName: string; contentVersion: number; id: string },
    sessionId: string,
  ): Promise<void> {
    this.broadcast({ data: content, type: "saveResourceContent" }, { excludeTag: `session:${sessionId}` });
  }

  async sendFriendRequest(friendRequest: FriendRequestInSocialWithRelations): Promise<void> {
    this.broadcast({ data: friendRequest, type: "sendFriendRequest" });
  }

  async updateAchievement(userAchievements: UserAchievementInAchievementWithRelations[]): Promise<void> {
    this.broadcast({ data: userAchievements, type: "updateAchievement" });
  }

  async updateUsage(storageUsage: StorageUsage): Promise<void> {
    this.broadcast({ data: storageUsage, type: "updateUsage" });
  }

  async updateUserToRoom(userToRoom: UserToRoomInMessage): Promise<void> {
    this.broadcast({ data: userToRoom, type: "updateUserToRoom" });
  }

  async upsertStatus(status: Parameters<UserObjectRpc["upsertStatus"]>[0]): Promise<void> {
    await setUserStatusInRooms(status);
  }

  // Presence reaches the rooms after the response, so a slow room never delays the socket it was opened on
  private reportPresence(userId: string, isConnected: boolean) {
    this.ctx.waitUntil(
      getResultAsync(() => setUserConnectedInRooms(userId, isConnected)).match(noop, (error) => {
        console.error("UserStatus failed to report presence", { error, isConnected, userId });
      }),
    );
  }

  // The alarm is the earliest reminder still ahead, or a retry for one that is overdue: the rows the alarm could not
  // send are still here, so the next run sends them, and the earlier of the two wins
  private async armAlarm(): Promise<void> {
    const now = new Date();
    const [overdue] = await this.db
      .select({ dueAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .limit(1);
    const [upcoming] = await this.db
      .select({ dueAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(gt(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt))
      .limit(1);
    const runAts = [
      ...(overdue ? [now.getTime() + TODO_REMINDER_RETRY_DELAY_MS] : []),
      ...(upcoming ? [upcoming.dueAt.getTime()] : []),
    ];
    if (runAts.length > 0) await this.ctx.storage.setAlarm(Math.min(...runAts));
    else await this.ctx.storage.deleteAlarm();
  }
}
