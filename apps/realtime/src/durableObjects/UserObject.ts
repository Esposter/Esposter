import type { TopicWatch } from "#src/models/user/TopicWatch";
import type {
  ColumnTopic,
  PageCursor,
  ReconcileTodoRemindersInput,
  RoomInMessage,
  ScheduledMessageInUser,
  ScheduledReminder,
  ScheduledReminderInput,
  SentMessageInUser,
  SentMessageInUserInput,
  Topic,
  UserAchievementInAchievementWithRelations,
  UserEvent,
  UserInAuth,
  UserObjectRpc,
  UserToRoomInMessage,
} from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { createObjectHandle } from "#src/services/durableObject/createObjectHandle";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { REMINDER_RETRY_DELAY_MS } from "#src/services/reminder/constants";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { checkTopicWatchSigned } from "#src/services/topic/checkTopicWatchSigned";
import { WATCHED_TOPIC_KEY_PREFIX } from "#src/services/topic/constants";
import { readSocketWatchId } from "#src/services/topic/readSocketWatchId";
import { setUserConnectedInRooms } from "#src/services/user/setUserConnectedInRooms";
import { setUserStatusInRooms } from "#src/services/user/setUserStatusInRooms";
import { createPageSort, getPageOrderBy, getPageWhere } from "@esposter/db";
import {
  AppNotificationType,
  getLiveRowWhere,
  joinedCallsInUser,
  publishNotification,
  QueueJob,
  remindersInUser,
  SCHEDULED_MESSAGE_JOB_PAGE_SORT,
  scheduledMessagesInUser,
  SENT_MESSAGE_PAGE_SORT,
  sentMessagesInUser,
  todoRemindersInUser,
  TOMBSTONE_RETENTION_MS,
  TopicKind,
  userClientFrameSchema,
} from "@esposter/db-schema";
import userMigrations from "@esposter/db-schema/objects/user/migrations/migrations";
import { getResult, getResultAsync, jsonDateParse, noop } from "@esposter/shared";
import { and, asc, count, eq, gt, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { v7 } from "uuid";

// The storage key of one watch, by the tab's id and the topic it watches
const getTopicWatchKey = (watchId: string, topic: Topic) => `${WATCHED_TOPIC_KEY_PREFIX}${watchId}:${topic}`;

const getWatchedTopics = (watches: TopicWatch[]) => new Set(watches.map(({ topic }) => topic));

// One User object per person: its SQLite indexes the messages they sent and their pending scheduled messages.
// Its reminders and TodoList reminders are held there too.
// Its one alarm is set to the earliest of them still ahead, or a retry for one that failed.
export class UserObject extends RealtimeObject<UserEvent, UserObjectRpc> implements UserObjectRpc {
  protected readonly db = createObjectHandle(createDurableObjectDatabase(this.ctx, userMigrations.migrations), {
    owned: true,
  });
  protected readonly topicKind = TopicKind.User;
  readonly #userId = getObjectName(this.ctx, "UserObject");

  // A reminder armed again under its id replaces the one it names, so a re-run of the step that armed it converges
  async addJoinedCall(callSessionId: string): Promise<void> {
    await this.db.insert(joinedCallsInUser).values({ callSessionId }).onConflictDoNothing();
  }

  async addReminder(reminder: ScheduledReminderInput): Promise<void> {
    await this.db
      .insert(remindersInUser)
      .values(reminder)
      .onConflictDoUpdate({
        set: { deletedAt: null, runAt: reminder.runAt, text: reminder.text },
        target: remindersInUser.id,
      });
    await this.#armAlarm();
  }

  async addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void> {
    await this.db
      .insert(scheduledMessagesInUser)
      .values(scheduledMessage)
      .onConflictDoUpdate({
        set: { deletedAt: null, runAt: scheduledMessage.runAt },
        target: scheduledMessagesInUser.scheduledId,
      });
  }

  async addSentMessage(sentMessage: SentMessageInUserInput): Promise<void> {
    await this.db.insert(sentMessagesInUser).values(sentMessage).onConflictDoNothing();
  }

  // A reminder whose send failed is retried this long after the failure.
  // The alarm is re-armed here and in the alarm itself, so a row that stays overdue is never left without one.
  override async alarm(): Promise<void> {
    await this.runInvocation("the alarm", () => this.#runAlarm());
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
    const [reminderCount] = await this.db
      .select({ count: count() })
      .from(remindersInUser)
      .where(getLiveRowWhere(remindersInUser));
    const [scheduledMessageCount] = await this.db
      .select({ count: count() })
      .from(scheduledMessagesInUser)
      .where(getLiveRowWhere(scheduledMessagesInUser));
    return (reminderCount?.count ?? 0) + (scheduledMessageCount?.count ?? 0);
  }

  // Every store the person's object holds is emptied, and its alarm cleared, when the account is erased. The sweep runs
  // This once the rooms its indexes name are swept, so a replay finds nothing left and the topics its tabs watched are
  // Let go of
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
      .where(and(getPageWhere(sort, cursor), getLiveRowWhere(remindersInUser)))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit);
  }

  // The scheduled messages the person's index names, soonest first by their id, from the cursor, at most `limit`
  // Of them. each is named by its id and its room, and its body is read from the room
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
      .where(and(getPageWhere(sort, cursor), getLiveRowWhere(scheduledMessagesInUser)))
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

  // A cancel leaves the reminder as a tombstone and answers with it, then re-arms the alarm for what is left, so a
  // Reminder that was next due no longer wakes it
  async removeReminder(id: string): Promise<ScheduledReminder | undefined> {
    const [tombstone] = await this.db
      .update(remindersInUser)
      .set({ deletedAt: new Date(), text: "" })
      .where(and(eq(remindersInUser.id, id), getLiveRowWhere(remindersInUser)))
      .returning();
    if (!tombstone) return undefined;

    await this.#armAlarm();
    return tombstone;
  }

  // A person who leaves a room, or whom the room removes or deletes, takes what they held for it: the reminders set
  // There and the index entries of the messages scheduled there. The alarm is re-armed for what is left, as a cancel
  // Does
  async removeRoomScheduledItems(roomId: string): Promise<void> {
    const deletedAt = new Date();
    await this.db
      .update(remindersInUser)
      .set({ deletedAt, text: "" })
      .where(and(eq(remindersInUser.roomId, roomId), getLiveRowWhere(remindersInUser)));
    await this.db
      .update(scheduledMessagesInUser)
      .set({ deletedAt })
      .where(and(eq(scheduledMessagesInUser.roomId, roomId), getLiveRowWhere(scheduledMessagesInUser)));
    await this.#armAlarm();
  }

  // The index entry of a scheduled message is a tombstone once the room sends or cancels it, and the list stops
  // Naming it. the alarm is re-armed so the tombstone's purge is scheduled, as a reminder's cancel does
  async removeScheduledMessage(scheduledId: string): Promise<void> {
    await this.db
      .update(scheduledMessagesInUser)
      .set({ deletedAt: new Date() })
      .where(and(eq(scheduledMessagesInUser.scheduledId, scheduledId), getLiveRowWhere(scheduledMessagesInUser)));
    await this.#armAlarm();
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

  roomActivity(room: RoomInMessage): void {
    this.broadcast({ data: room, type: "roomActivity" });
  }

  updateAchievement(userAchievements: UserAchievementInAchievementWithRelations[]): Promise<void> {
    return this.broadcastEvent({ data: userAchievements, type: "updateAchievement" });
  }

  updateUsage(user: UserInAuth): Promise<void> {
    return this.broadcastEvent({ data: user, type: "updateUsage" });
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
  // A watch subscribes its topics on every frame, since a subscribe is idempotent and one that failed on an earlier
  // Watch is then retried. An unwatch unsubscribes the topics no other tab of the person's still watches.
  // So a topic holds each person once, however many tabs they have. A watch is taken only when its signature covers it,
  // So a frame naming a topic its read did not name is refused whole, before anything is stored or subscribed
  override async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (typeof message !== "string") return;
    // A frame that is not JSON reads as undefined, which the schema below refuses, so a garbled frame is dropped
    const parsedJson: unknown = getResult(() => jsonDateParse(message)).unwrapOr(undefined);
    const frame = userClientFrameSchema.safeParse(parsedJson);
    if (!frame.success) return;

    const watchId = readSocketWatchId(ws) ?? this.#attachWatchId(ws);
    if (frame.data.type === "watch") {
      if (!checkTopicWatchSigned(this.#userId, frame.data.data, Date.now())) return;

      const { readAt, topics } = frame.data.data;
      await Promise.all(
        topics.map(({ topic }) =>
          this.ctx.storage.put(getTopicWatchKey(watchId, topic), { topic, watchId } satisfies TopicWatch),
        ),
      );
      await this.#subscribeTopics(topics, readAt);
      return;
    }

    const { topics } = frame.data.data;
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
      .where(and(lte(remindersInUser.runAt, now), getLiveRowWhere(remindersInUser)))
      .limit(1);
    const [overdueTodoReminder] = await this.db
      .select({ runAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(lte(todoRemindersInUser.dueAt, now))
      .limit(1);
    const [upcomingReminder] = await this.db
      .select({ runAt: remindersInUser.runAt })
      .from(remindersInUser)
      .where(and(gt(remindersInUser.runAt, now), getLiveRowWhere(remindersInUser)))
      .orderBy(asc(remindersInUser.runAt))
      .limit(1);
    // The oldest tombstone of each table is due for the purge once its retention has passed, so the alarm wakes then
    const tombstoneExpiries = await Promise.all([
      this.#readOldestTombstoneExpiry(remindersInUser),
      this.#readOldestTombstoneExpiry(scheduledMessagesInUser),
    ]);
    const [upcomingTodoReminder] = await this.db
      .select({ runAt: todoRemindersInUser.dueAt })
      .from(todoRemindersInUser)
      .where(gt(todoRemindersInUser.dueAt, now))
      .orderBy(asc(todoRemindersInUser.dueAt))
      .limit(1);
    const runAts = [
      ...(overdueReminder || overdueTodoReminder ? [now.getTime() + REMINDER_RETRY_DELAY_MS] : []),
      ...[upcomingReminder, upcomingTodoReminder].flatMap((upcoming) => (upcoming ? [upcoming.runAt.getTime()] : [])),
      ...tombstoneExpiries.flatMap((expiry) => (expiry ? [expiry.getTime()] : [])),
    ];
    if (runAts.length > 0) await this.ctx.storage.setAlarm(Math.min(...runAts));
    else await this.ctx.storage.deleteAlarm();
  }

  // A tab's watches are keyed by an id its socket carries from its first watch, so the socket names them after
  // Hibernation
  #attachWatchId(ws: WebSocket): string {
    const watchId = v7();
    ws.serializeAttachment({ watchId });
    return watchId;
  }

  // A topic is named to its Topic object, which takes subscriptions, not invocations, so no object's invoke answers it
  #getTopicObject(topic: Topic) {
    /* oxlint-disable-next-line selector-ban/no-restricted-syntax -- the one place a Topic object is named in this
       object; its subscriptions are not invocations */
    return this.env.TOPIC.get(this.env.TOPIC.idFromName(topic));
  }

  // The object's tables are not D1, so the nightly D1 purge does not reach them: the alarm removes each tombstone once
  // The tombstone retention has passed, the age a client forgets its own copy at. A tombstone is hidden from every
  // Read, so its removal changes no view and wakes no read
  async #purgeExpiredTombstones(now: Date): Promise<void> {
    const cutoff = new Date(now.getTime() - TOMBSTONE_RETENTION_MS);
    await this.db.delete(remindersInUser).where(lte(remindersInUser.deletedAt, cutoff));
    await this.db.delete(scheduledMessagesInUser).where(lte(scheduledMessagesInUser.deletedAt, cutoff));
  }

  // The earliest moment a table's oldest tombstone is purged, or nothing when it holds none
  async #readOldestTombstoneExpiry(
    table: typeof remindersInUser | typeof scheduledMessagesInUser,
  ): Promise<Date | undefined> {
    const [oldestTombstone] = await this.db
      .select({ deletedAt: table.deletedAt })
      .from(table)
      .where(isNotNull(table.deletedAt))
      .orderBy(asc(table.deletedAt))
      .limit(1);
    return oldestTombstone?.deletedAt
      ? new Date(oldestTombstone.deletedAt.getTime() + TOMBSTONE_RETENTION_MS)
      : undefined;
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

  async #runAlarm(): Promise<void> {
    const now = new Date();
    await this.#purgeExpiredTombstones(now);
    await this.#sendDueTodoReminders(now);
    await this.#sendDueReminders(now);
    await this.#armAlarm();
  }

  // The reminder is published to the notification queue as the person's own, and tombstoned only once it is queued.
  // So a failed publish is retried rather than dropped.
  async #sendDueReminders(now: Date): Promise<void> {
    const dueReminders = await this.db
      .select()
      .from(remindersInUser)
      .where(and(lte(remindersInUser.runAt, now), getLiveRowWhere(remindersInUser)))
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
        if (isSent)
          await this.db
            .update(remindersInUser)
            .set({ deletedAt: now, text: "" })
            .where(eq(remindersInUser.id, reminder.id));
      }),
    );
  }

  // Each TodoList reminder is removed only once its notification is queued, so a failed send is retried rather
  // Than dropped. the delete holds only for the due time the alarm read, so a row a save re-dated while the send was in
  // Flight stays armed
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

  // The topics a watch asked for, subscribed to on their Topic objects from the time its read began, with the columns
  // The watch reads of each. A subscribe is a write of the person's id, so repeating it is harmless
  async #subscribeTopics(topics: ColumnTopic[], readAt: number): Promise<void> {
    await Promise.all(
      topics.map(({ columns, topic }) => this.#getTopicObject(topic).subscribe(this.#userId, readAt, columns)),
    );
  }

  // The topics no tab of the person's watches any more, unsubscribed from their Topic objects
  async #unsubscribeTopics(before: Set<Topic>, after: Set<Topic>): Promise<void> {
    await Promise.all(
      [...before]
        .filter((topic) => !after.has(topic))
        .map((topic) => this.#getTopicObject(topic).unsubscribe(this.#userId)),
    );
  }
}
