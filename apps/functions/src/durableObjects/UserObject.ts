import type {
  FriendInSocial,
  FriendRequestInSocial,
  FriendRequestInSocialWithRelations,
  PublicUser,
  ReconcileTodoRemindersInput,
  ScheduledReminder,
  SentMessageCursor,
  StorageUsage,
  UserAchievementInAchievementWithRelations,
  UserEvent,
  UserObjectRpc,
  UserToRoomInMessage,
} from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import userMigrations from "#src/durableObjects/user/migrations/migrations.js";
import {
  remindersInUser,
  scheduledMessagesInUser,
  sentMessagesInUser,
  todoRemindersInUser,
} from "#src/durableObjects/user/schema";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { REMINDER_RETRY_DELAY_MS } from "#src/services/reminder/constants";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { setUserConnectedInRooms } from "#src/services/user/setUserConnectedInRooms";
import { setUserStatusInRooms } from "#src/services/user/setUserStatusInRooms";
import { AppNotificationType, publishNotification } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, asc, eq, gt, inArray, lt, lte, or, sql } from "drizzle-orm";

// One User object per person: its SQLite holds the index of the messages they sent, their pending scheduled messages, their
// reminders and their TodoList reminders, and its one alarm is set to the earliest of them still ahead, or a retry for one
// that failed
export class UserObject extends RealtimeObject<UserEvent> implements UserObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, userMigrations.migrations);
  private readonly userId = getObjectName(this.ctx, "UserObject");

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
    await this.sendDueTodoReminders(now);
    await this.sendDueReminders(now);
    await this.armAlarm();
  }

  // A room-list event sent to every tab the person has open, whichever room's write or D1 change raised it
  async broadcastEvent(event: UserEvent): Promise<void> {
    this.broadcast(event);
  }

  // A revoked session's sockets close here and no other session's do. Each close runs the base's own close hook, so the
  // presence it ends is reported like any other close
  async closeSession(sessionId: string): Promise<void> {
    this.closeRevokedSession(sessionId);
  }

  async addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void> {
    await this.db
      .insert(scheduledMessagesInUser)
      .values(scheduledMessage)
      .onConflictDoUpdate({ set: { runAt: scheduledMessage.runAt }, target: scheduledMessagesInUser.scheduledId });
  }

  async addReminder(reminder: ScheduledReminder): Promise<void> {
    await this.db.insert(remindersInUser).values(reminder);
    await this.armAlarm();
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

  async readReminders(): Promise<ScheduledReminder[]> {
    return this.db.select().from(remindersInUser).orderBy(asc(remindersInUser.runAt));
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

  // A cancel removes the row and re-arms the alarm for what is left, so a reminder that was next due no longer wakes it
  async removeReminder(id: string): Promise<boolean> {
    const deletedRows = await this.db
      .delete(remindersInUser)
      .where(eq(remindersInUser.id, id))
      .returning({ id: remindersInUser.id });
    if (deletedRows.length === 0) return false;

    await this.armAlarm();
    return true;
  }

  async removeScheduledMessage(scheduledId: string): Promise<void> {
    await this.db.delete(scheduledMessagesInUser).where(eq(scheduledMessagesInUser.scheduledId, scheduledId));
  }

  async removeSentMessage(input: { messageId: number; roomId: string }): Promise<void> {
    await this.db
      .delete(sentMessagesInUser)
      .where(and(eq(sentMessagesInUser.roomId, input.roomId), eq(sentMessagesInUser.messageId, input.messageId)));
  }

  // The person's own events, each to every tab they have open. A save leaves out only the tab that made it, since that
  // tab already shows the change, and the other tabs of the same session still need to hear it
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
    deviceId: string,
  ): Promise<void> {
    this.broadcast(
      { data: content, type: "saveResourceContent" },
      deviceId ? { excludeTag: `device:${deviceId}` } : {},
    );
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

  // Each TodoList reminder is removed only once its notification is queued, so a failed send is retried rather than dropped
  private async sendDueTodoReminders(now: Date): Promise<void> {
    const dueReminders = await this.db
      .select()
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt));
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
  }

  // The reminder is published to the notification queue as the person's own, and removed only once it is queued, so a
  // failed publish is retried rather than dropped
  private async sendDueReminders(now: Date): Promise<void> {
    const dueReminders = await this.db
      .select()
      .from(remindersInUser)
      .where(lte(remindersInUser.runAt, now))
      .orderBy(asc(remindersInUser.runAt));
    for (const reminder of dueReminders) {
      const isSent = await getResultAsync(() =>
        publishNotification(this.env.PROCESS_NOTIFICATION_QUEUE, {
          roomId: reminder.roomId,
          text: reminder.text,
          type: AppNotificationType.Reminder,
          userId: this.userId,
        }),
      ).match(
        () => true,
        (error) => {
          console.error("Reminder failed to send", { error, id: reminder.id });
          return false;
        },
      );
      if (isSent) await this.db.delete(remindersInUser).where(eq(remindersInUser.id, reminder.id));
    }
  }

  // The alarm is the earliest row still ahead across the reminders and the TodoList reminders, or a retry for one that is
  // overdue: the rows the alarm could not send are still here, so the next run sends them, and the earliest wins
  private async armAlarm(): Promise<void> {
    const now = new Date();
    const [overdueReminder] = await this.db
      .select({ runAt: remindersInUser.runAt })
      .from(remindersInUser)
      .where(lte(remindersInUser.runAt, now))
      .limit(1);
    const [overdueTodoReminder] = await this.db
      .select({ runAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .limit(1);
    const [upcomingReminder] = await this.db
      .select({ runAt: remindersInUser.runAt })
      .from(remindersInUser)
      .where(gt(remindersInUser.runAt, now))
      .orderBy(asc(remindersInUser.runAt))
      .limit(1);
    const [upcomingTodoReminder] = await this.db
      .select({ runAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(gt(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt))
      .limit(1);
    const runAts = [
      ...(overdueReminder || overdueTodoReminder ? [now.getTime() + REMINDER_RETRY_DELAY_MS] : []),
      ...[upcomingReminder, upcomingTodoReminder].flatMap((upcoming) => (upcoming ? [upcoming.runAt.getTime()] : [])),
    ];
    if (runAts.length > 0) await this.ctx.storage.setAlarm(Math.min(...runAts));
    else await this.ctx.storage.deleteAlarm();
  }
}
