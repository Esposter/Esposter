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
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { REMINDER_RETRY_DELAY_MS } from "#src/services/reminder/constants";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { setUserConnectedInRooms } from "#src/services/user/setUserConnectedInRooms";
import { setUserStatusInRooms } from "#src/services/user/setUserStatusInRooms";
import { AppNotificationType, publishNotification } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, asc, eq, gt, inArray, lt, lte, or, sql } from "drizzle-orm";

// One User object per person: its SQLite indexes the messages they sent and their pending scheduled messages.
// Its reminders and TodoList reminders are held there too.
// Its one alarm is set to the earliest of them still ahead, or a retry for one that failed.
export class UserObject extends RealtimeObject<UserEvent> implements UserObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, userMigrations.migrations);
  readonly #userId = getObjectName(this.ctx, "UserObject");

  // The person's own events, each to every tab they have open
  acceptFriendRequest(input: { receiverUser: PublicUser; senderUser: PublicUser }): Promise<void> {
    this.broadcast({ data: input, type: "acceptFriendRequest" });
    return Promise.resolve();
  }

  async addReminder(reminder: ScheduledReminder): Promise<void> {
    await this.db.insert(remindersInUser).values(reminder);
    await this.#armAlarm();
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

  // A reminder whose send failed is retried this long after the failure.
  // The alarm is re-armed here and in the alarm itself, so a row that stays overdue is never left without one.
  override async alarm(): Promise<void> {
    const now = new Date();
    await this.#sendDueTodoReminders(now);
    await this.#sendDueReminders(now);
    await this.#armAlarm();
  }

  // A room-list event sent to every tab the person has open, whichever room's write or D1 change raised it
  broadcastEvent(event: UserEvent): Promise<void> {
    this.broadcast(event);
    return Promise.resolve();
  }

  // A revoked session's sockets close here and no other session's do.
  // Each close runs the base's own close hook, so the presence it ends is reported like any other close.
  closeSession(sessionId: string): Promise<void> {
    this.closeRevokedSession(sessionId);
    return Promise.resolve();
  }

  declineFriendRequest(input: Pick<FriendRequestInSocial, "receiverId" | "senderId">): Promise<void> {
    this.broadcast({ data: input, type: "declineFriendRequest" });
    return Promise.resolve();
  }

  deleteFriend(input: Pick<FriendInSocial, "receiverId" | "senderId">): Promise<void> {
    this.broadcast({ data: input, type: "deleteFriend" });
    return Promise.resolve();
  }

  // The first socket brings the person online and the last one to close takes them offline.
  // The count is taken before the base accepts the socket.
  // That accept runs synchronously inside its fetch, so a concurrent upgrade sees it.
  override async fetch(request: Request): Promise<Response> {
    const isFirstSocket = this.ctx.getWebSockets().length === 0;
    const response = await super.fetch(request);
    const identity = readSocketIdentity(request.headers);
    if (isFirstSocket && response.status === 101 && identity) this.#reportPresence(identity.userId, true);
    return response;
  }

  async readReminders(): Promise<ScheduledReminder[]> {
    return this.db.select().from(remindersInUser).orderBy(asc(remindersInUser.runAt));
  }

  async readScheduledMessages() {
    return this.db.select().from(scheduledMessagesInUser).orderBy(asc(scheduledMessagesInUser.runAt));
  }

  // Ordered newest first, and a page is the rows strictly before the cursor.
  // So a message sent at the same instant to many rooms is neither repeated nor skipped across a page boundary.
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
    await this.#armAlarm();
  }

  // A cancel removes the row and re-arms the alarm for what is left, so a reminder that was next due no longer wakes it
  async removeReminder(id: string): Promise<boolean> {
    const deletedRows = await this.db
      .delete(remindersInUser)
      .where(eq(remindersInUser.id, id))
      .returning({ id: remindersInUser.id });
    if (deletedRows.length === 0) return false;

    await this.#armAlarm();
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

  replaceSession(sessionId: string): Promise<void> {
    this.broadcast({ data: { sessionId }, type: "replaceSession" });
    return Promise.resolve();
  }

  roomActivity(roomId: string, updatedAt: Date): void {
    this.broadcast({ data: { id: roomId, updatedAt }, type: "roomActivity" });
  }

  // A save leaves out only the tab that made it, since that tab already shows the change.
  // The other tabs of the same session still need to hear it.
  saveResourceContent(
    content: { apiKeyName: string; contentVersion: number; id: string },
    deviceId: string,
  ): Promise<void> {
    this.broadcast(
      { data: content, type: "saveResourceContent" },
      deviceId ? { excludeTag: `device:${deviceId}` } : {},
    );
    return Promise.resolve();
  }

  sendFriendRequest(friendRequest: FriendRequestInSocialWithRelations): Promise<void> {
    this.broadcast({ data: friendRequest, type: "sendFriendRequest" });
    return Promise.resolve();
  }

  updateAchievement(userAchievements: UserAchievementInAchievementWithRelations[]): Promise<void> {
    this.broadcast({ data: userAchievements, type: "updateAchievement" });
    return Promise.resolve();
  }

  updateUsage(storageUsage: StorageUsage): Promise<void> {
    this.broadcast({ data: storageUsage, type: "updateUsage" });
    return Promise.resolve();
  }

  updateUserToRoom(userToRoom: UserToRoomInMessage): Promise<void> {
    this.broadcast({ data: userToRoom, type: "updateUserToRoom" });
    return Promise.resolve();
  }

  async upsertStatus(status: Parameters<UserObjectRpc["upsertStatus"]>[0]): Promise<void> {
    await setUserStatusInRooms(status);
  }

  override webSocketClose(ws: WebSocket, code: number, reason: string) {
    super.webSocketClose(ws, code, reason);
    const userId = this.ctx.id.name;
    if (userId && this.ctx.getWebSockets().every((socket) => socket === ws)) this.#reportPresence(userId, false);
  }

  // The alarm is the earliest row still ahead across the reminders and the TodoList reminders.
  // A retry stands in for an overdue one, since the rows the alarm could not send are still here for the next run.
  // The earliest of them wins.
  async #armAlarm(): Promise<void> {
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

  // Presence reaches the rooms after the response, so a slow room never delays the socket it was opened on
  #reportPresence(userId: string, isConnected: boolean) {
    this.ctx.waitUntil(
      getResultAsync(() => setUserConnectedInRooms(userId, isConnected)).match(noop, (error) => {
        console.error("UserStatus failed to report presence", { error, isConnected, userId });
      }),
    );
  }

  // The reminder is published to the notification queue as the person's own, and removed only once it is queued.
  // So a failed publish is retried rather than dropped.
  async #sendDueReminders(now: Date): Promise<void> {
    const dueReminders = await this.db
      .select()
      .from(remindersInUser)
      .where(lte(remindersInUser.runAt, now))
      .orderBy(asc(remindersInUser.runAt));
    await Promise.all(
      dueReminders.map(async (reminder) => {
        const isSent = await getResultAsync(() =>
          publishNotification(this.env.PROCESS_NOTIFICATION_QUEUE, {
            roomId: reminder.roomId,
            text: reminder.text,
            type: AppNotificationType.Reminder,
            userId: this.#userId,
          }),
        ).match(
          () => true,
          (error) => {
            console.error("Reminder failed to send", { error, id: reminder.id });
            return false;
          },
        );
        if (isSent) await this.db.delete(remindersInUser).where(eq(remindersInUser.id, reminder.id));
      }),
    );
  }

  // Each TodoList reminder is removed only once its notification is queued, so a failed send is retried rather than dropped
  async #sendDueTodoReminders(now: Date): Promise<void> {
    const dueReminders = await this.db
      .select()
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt));
    await Promise.all(
      dueReminders.map(async (reminder) => {
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
      }),
    );
  }
}
