import type { TopicWatch } from "#src/models/user/TopicWatch";
import type {
  FriendInSocial,
  FriendRequestInSocial,
  FriendRequestInSocialWithRelations,
  PageCursor,
  PublicUser,
  ReconcileTodoRemindersInput,
  ScheduledMessageInUser,
  ScheduledReminder,
  SentMessageInUser,
  StorageUsage,
  Topic,
  UserAchievementInAchievementWithRelations,
  UserEvent,
  UserObjectRpc,
  UserToRoomInMessage,
} from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { REMINDER_RETRY_DELAY_MS } from "#src/services/reminder/constants";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { WATCHED_TOPIC_KEY_PREFIX } from "#src/services/topic/constants";
import { readSocketWatchId } from "#src/services/topic/readSocketWatchId";
import { setUserConnectedInRooms } from "#src/services/user/setUserConnectedInRooms";
import { setUserStatusInRooms } from "#src/services/user/setUserStatusInRooms";
import { createPageSort, getPageOrderBy, getPageWhere } from "@esposter/db";
import {
  AppNotificationType,
  getDeviceSocketTag,
  joinedCallsInUser,
  publishNotification,
  QueueJob,
  remindersInUser,
  SCHEDULED_MESSAGE_JOB_PAGE_SORT,
  scheduledMessagesInUser,
  SENT_MESSAGE_PAGE_SORT,
  sentMessagesInUser,
  todoRemindersInUser,
  userClientFrameSchema,
} from "@esposter/db-schema";
import userMigrations from "@esposter/db-schema/objects/user/migrations/migrations";
import { getResult, getResultAsync, jsonDateParse, noop } from "@esposter/shared";
import { and, asc, count, eq, gt, inArray, lte, sql } from "drizzle-orm";
import { v7 } from "uuid";

// The storage key of one watch, by the tab's id and the topic it watches
const getTopicWatchKey = (watchId: string, topic: Topic) => `${WATCHED_TOPIC_KEY_PREFIX}${watchId}:${topic}`;

const getWatchedTopics = (watches: TopicWatch[]) => new Set(watches.map(({ topic }) => topic));

// One User object per person: its SQLite indexes the messages they sent and their pending scheduled messages.
// Its reminders and TodoList reminders are held there too.
// Its one alarm is set to the earliest of them still ahead, or a retry for one that failed.
export class UserObject extends RealtimeObject<UserEvent> implements UserObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, userMigrations.migrations);
  readonly #userId = getObjectName(this.ctx, "UserObject");

  acceptFriendRequest(input: { receiverUser: PublicUser; senderUser: PublicUser }): Promise<void> {
    return this.broadcastEvent({ data: input, type: "acceptFriendRequest" });
  }

  // A reminder armed again under its id replaces the one it names, so a re-run of the step that armed it converges
  async addJoinedCall(callSessionId: string): Promise<void> {
    await this.db.insert(joinedCallsInUser).values({ callSessionId }).onConflictDoNothing();
  }

  async addReminder(reminder: ScheduledReminder): Promise<void> {
    await this.db
      .insert(remindersInUser)
      .values(reminder)
      .onConflictDoUpdate({ set: { runAt: reminder.runAt, text: reminder.text }, target: remindersInUser.id });
    await this.#armAlarm();
  }

  async addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void> {
    await this.db
      .insert(scheduledMessagesInUser)
      .values(scheduledMessage)
      .onConflictDoUpdate({ set: { runAt: scheduledMessage.runAt }, target: scheduledMessagesInUser.scheduledId });
  }

  async addSentMessage(sentMessage: SentMessageInUser): Promise<void> {
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

  // A room-list event sent to every tab the person has open, whichever room's write or D1 change raised it. The sockets
  // Carrying `excludeTag` are left out, so a write's own tab does not hear its echo
  broadcastEvent(event: UserEvent, { excludeTag }: { excludeTag?: string } = {}): Promise<void> {
    this.broadcast(event, { excludeTag });
    return Promise.resolve();
  }

  // A revoked session's sockets close here and no other session's do.
  // Each close runs the base's own close hook, so the presence it ends is reported like any other close.
  closeSession(sessionId: string): Promise<void> {
    this.closeRevokedSession(sessionId);
    return Promise.resolve();
  }

  // The reminders and scheduled messages the person holds, counted together
  async countScheduledMessageJobs(): Promise<number> {
    const [reminderCount] = await this.db.select({ count: count() }).from(remindersInUser);
    const [scheduledMessageCount] = await this.db.select({ count: count() }).from(scheduledMessagesInUser);
    return (reminderCount?.count ?? 0) + (scheduledMessageCount?.count ?? 0);
  }

  declineFriendRequest(input: Pick<FriendRequestInSocial, "receiverId" | "senderId">): Promise<void> {
    return this.broadcastEvent({ data: input, type: "declineFriendRequest" });
  }

  deleteFriend(input: Pick<FriendInSocial, "receiverId" | "senderId">): Promise<void> {
    return this.broadcastEvent({ data: input, type: "deleteFriend" });
  }

  // Every store the person's object holds is emptied, and its alarm cleared, when the account is erased. The sweep runs this
  // Once the rooms its indexes name are swept, so a replay finds nothing left and the topics its tabs watched are let go of
  async erase(): Promise<void> {
    const watches = [...(await this.ctx.storage.list<TopicWatch>({ prefix: WATCHED_TOPIC_KEY_PREFIX })).values()];
    await this.db.delete(remindersInUser);
    await this.db.delete(todoRemindersInUser);
    await this.db.delete(joinedCallsInUser);
    await this.db.delete(scheduledMessagesInUser);
    await this.db.delete(sentMessagesInUser);
    await Promise.all(watches.map(({ topic, watchId }) => this.ctx.storage.delete(getTopicWatchKey(watchId, topic))));
    await this.ctx.storage.deleteAlarm();
    await this.#unsubscribeTopics(getWatchedTopics(watches), new Set());
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

  // A topic one of the person's tabs watches changed, and each tab watching it hears so
  async invalidate(topic: Topic): Promise<void> {
    const watchIds = new Set(
      (await this.#readTopicWatches()).flatMap((watch) => (watch.topic === topic ? [watch.watchId] : [])),
    );
    for (const socket of this.ctx.getWebSockets()) {
      const watchId = readSocketWatchId(socket);
      if (watchId !== undefined && watchIds.has(watchId))
        this.sendEvent(socket, { data: { topic }, type: "invalidate" });
    }
  }

  async readJoinedCallIds(): Promise<string[]> {
    return (await this.db.select().from(joinedCallsInUser)).map(({ callSessionId }) => callSessionId);
  }

  // The reminders the person holds, soonest first by their id, from the cursor, at most `limit` of them
  async readReminders({ cursor, limit }: { cursor: PageCursor; limit: number }): Promise<ScheduledReminder[]> {
    const sort = createPageSort(
      { id: remindersInUser.id, runAt: remindersInUser.runAt },
      SCHEDULED_MESSAGE_JOB_PAGE_SORT,
    );
    return this.db
      .select()
      .from(remindersInUser)
      .where(getPageWhere(sort, cursor))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit);
  }

  // The scheduled messages the person's index names, soonest first by their id, from the cursor, at most `limit` of them.
  // Each is named by its id and its room, and its body is read from the room
  async readScheduledMessages({
    cursor,
    limit,
  }: {
    cursor: PageCursor;
    limit: number;
  }): Promise<ScheduledMessageInUser[]> {
    const sort = createPageSort(
      { id: scheduledMessagesInUser.scheduledId, runAt: scheduledMessagesInUser.runAt },
      SCHEDULED_MESSAGE_JOB_PAGE_SORT,
    );
    return this.db
      .select({
        id: scheduledMessagesInUser.scheduledId,
        roomId: scheduledMessagesInUser.roomId,
        runAt: scheduledMessagesInUser.runAt,
      })
      .from(scheduledMessagesInUser)
      .where(getPageWhere(sort, cursor))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit);
  }

  // The messages the person sent, newest first from the cursor, at most `limit` of them
  async readSentMessages({ cursor, limit }: { cursor: PageCursor; limit: number }): Promise<SentMessageInUser[]> {
    const sort = createPageSort(
      {
        createdAt: sentMessagesInUser.createdAt,
        messageId: sentMessagesInUser.messageId,
        roomId: sentMessagesInUser.roomId,
      },
      SENT_MESSAGE_PAGE_SORT,
    );
    return this.db
      .select()
      .from(sentMessagesInUser)
      .where(getPageWhere(sort, cursor))
      .orderBy(...getPageOrderBy(sort, cursor))
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

  async removeJoinedCall(callSessionId: string): Promise<void> {
    await this.db.delete(joinedCallsInUser).where(eq(joinedCallsInUser.callSessionId, callSessionId));
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

  // The sent messages a room's delete or erase removed, by their ids, dropped from the person's index in one statement
  async removeSentMessages({ messageIds, roomId }: { messageIds: number[]; roomId: string }): Promise<void> {
    await this.db
      .delete(sentMessagesInUser)
      .where(and(eq(sentMessagesInUser.roomId, roomId), inArray(sentMessagesInUser.messageId, messageIds)));
  }

  async removeSentMessagesInRoom(roomId: string): Promise<void> {
    await this.db.delete(sentMessagesInUser).where(eq(sentMessagesInUser.roomId, roomId));
  }

  replaceSession(sessionId: string): Promise<void> {
    return this.broadcastEvent({ data: { sessionId }, type: "replaceSession" });
  }

  roomActivity(roomId: string, lastMessageAt: Date): void {
    this.broadcast({ data: { id: roomId, lastMessageAt }, type: "roomActivity" });
  }

  // A save leaves out only the tab that made it, since that tab already shows the change.
  // The other tabs of the same session still need to hear it.
  saveResourceContent(
    content: { apiKeyName: string; contentVersion: number; id: string },
    deviceId: string,
  ): Promise<void> {
    return this.broadcastEvent(
      { data: content, type: "saveResourceContent" },
      deviceId ? { excludeTag: getDeviceSocketTag(deviceId) } : {},
    );
  }

  sendFriendRequest(friendRequest: FriendRequestInSocialWithRelations): Promise<void> {
    return this.broadcastEvent({ data: friendRequest, type: "sendFriendRequest" });
  }

  updateAchievement(userAchievements: UserAchievementInAchievementWithRelations[]): Promise<void> {
    return this.broadcastEvent({ data: userAchievements, type: "updateAchievement" });
  }

  updateUsage(storageUsage: StorageUsage): Promise<void> {
    return this.broadcastEvent({ data: storageUsage, type: "updateUsage" });
  }

  updateUserToRoom(userToRoom: UserToRoomInMessage): Promise<void> {
    return this.broadcastEvent({ data: userToRoom, type: "updateUserToRoom" });
  }

  async upsertStatus(status: Parameters<UserObjectRpc["upsertStatus"]>[0]): Promise<void> {
    await setUserStatusInRooms(status);
  }

  // The watches a closing tab held are dropped, and the topics no other tab watches are let go of
  override async webSocketClose(ws: WebSocket, code: number, reason: string) {
    const watchesBefore = await this.#readTopicWatches();
    await super.webSocketClose(ws, code, reason);
    const userId = this.ctx.id.name;
    if (userId && this.ctx.getWebSockets().every((socket) => socket === ws)) this.#reportPresence(userId, false);
    const closingWatchId = readSocketWatchId(ws);
    await Promise.all(
      watchesBefore.flatMap(({ topic, watchId }) =>
        watchId === closingWatchId ? [this.ctx.storage.delete(getTopicWatchKey(watchId, topic))] : [],
      ),
    );
    await this.#unsubscribeTopics(getWatchedTopics(watchesBefore), getWatchedTopics(await this.#readTopicWatches()));
  }

  // A tab watches or unwatches the topics of its mounted queries.
  // A watch subscribes its topics on every frame, since a subscribe is idempotent and one that failed on an earlier watch is
  // Then retried. An unwatch unsubscribes the topics no other tab of the person's still watches.
  // So a topic holds each person once, however many tabs they have
  override async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (typeof message !== "string") return;
    const parsedJson: unknown = getResult(() => jsonDateParse(message)).unwrapOr(undefined);
    const frame = userClientFrameSchema.safeParse(parsedJson);
    if (!frame.success) return;

    const watchId = readSocketWatchId(ws) ?? this.#attachWatchId(ws);
    const { topics } = frame.data.data;
    if (frame.data.type === "watch") {
      await Promise.all(
        topics.map((topic) =>
          this.ctx.storage.put(getTopicWatchKey(watchId, topic), { topic, watchId } satisfies TopicWatch),
        ),
      );
      await this.#subscribeTopics(topics);
      return;
    }

    const watchesBefore = await this.#readTopicWatches();
    await Promise.all(topics.map((topic) => this.ctx.storage.delete(getTopicWatchKey(watchId, topic))));
    await this.#unsubscribeTopics(getWatchedTopics(watchesBefore), getWatchedTopics(await this.#readTopicWatches()));
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

  // A tab's watches are keyed by an id its socket carries from its first watch, so the socket names them after hibernation
  #attachWatchId(ws: WebSocket): string {
    const watchId = v7();
    ws.serializeAttachment({ watchId });
    return watchId;
  }

  // Every watch a live tab holds. A watch whose socket is gone is left out, so a close the object never heard of cannot
  // Keep a topic subscribed
  async #readTopicWatches(): Promise<TopicWatch[]> {
    const liveWatchIds = new Set(this.ctx.getWebSockets().flatMap((socket) => readSocketWatchId(socket) ?? []));
    const watches = await this.ctx.storage.list<TopicWatch>({ prefix: WATCHED_TOPIC_KEY_PREFIX });
    return [...watches.values()].filter(({ watchId }) => liveWatchIds.has(watchId));
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
          publishNotification(getJobQueue(QueueJob.ProcessNotification), {
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

  // Each TodoList reminder is removed only once its notification is queued, so a failed send is retried rather than dropped.
  // The delete holds only for the due time the alarm read, so a row a save re-dated while the send was in flight stays armed
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
                eq(todoRemindersInUser.dueAt, reminder.dueAt),
              ),
            );
      }),
    );
  }

  // The topics a watch asked for, subscribed to on their Topic objects. A subscribe is a write of the person's id, so repeating it is harmless
  async #subscribeTopics(topics: Topic[]): Promise<void> {
    await Promise.all(
      topics.map((topic) => this.env.TOPIC.get(this.env.TOPIC.idFromName(topic)).subscribe(this.#userId)),
    );
  }

  // The topics no tab of the person's watches any more, unsubscribed from their Topic objects
  async #unsubscribeTopics(before: Set<Topic>, after: Set<Topic>): Promise<void> {
    await Promise.all(
      [...before]
        .filter((topic) => !after.has(topic))
        .map((topic) => this.env.TOPIC.get(this.env.TOPIC.idFromName(topic)).unsubscribe(this.#userId)),
    );
  }
}
