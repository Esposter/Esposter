/* oxlint-disable no-await-in-loop -- Each step reads the last: a send's slowmode check reads the clock an earlier send in the loop wrote, and messages enter the list in run order */
import type { NewMessage } from "#src/models/room/NewMessage";
import type { NotifyUser } from "#src/models/room/NotifyUser";
import type { SendOptions } from "#src/models/room/SendOptions";
import type {
  CreateRoomMessageInput,
  CreateWebhookRoomMessageInput,
  FileEntity,
  PageCursor,
  PageSort,
  RoomActor,
  RoomEvent,
  RoomMessage,
  RoomObjectRpc,
  RoomReaction,
  RoomReactionKey,
  RoomSearchInput,
  RoomSearchResult,
  ScheduledRoomMessage,
  UserEvent,
  UserStatusInMessage,
} from "@esposter/db-schema";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { applyPollVote } from "#src/services/room/applyPollVote";
import {
  MESSAGE_REPLAY_LIMIT,
  ROOM_ACTIVITY_DELAY_MS,
  ROOM_MEMBER_REMOVED_CODE,
  ROOM_STATE_ID,
  WRITE_RETRY_DELAY_MS,
} from "#src/services/room/constants";
import { getFilenames } from "#src/services/room/getFilenames";
import { getMessageMentions } from "#src/services/room/getMessageMentions";
import { getMessageRow } from "#src/services/room/getMessageRow";
import { getReactedByWhere } from "#src/services/room/getReactedByWhere";
import { getRoomSearchConditions } from "#src/services/room/getRoomSearchConditions";
import { getSendOptions } from "#src/services/room/getSendOptions";
import {
  claimMessageSendSlot,
  createPageSort,
  createReplyThreadFollows,
  getLinkPreviewResponse,
  getPageOrderBy,
  getPageWhere,
  incrementMentionCounts,
} from "@esposter/db";
import {
  AppNotificationType,
  appUsersInMessage,
  DatabaseEntityType,
  MESSAGE_BATCH_MAX_LENGTH,
  messageEmojisInRoom,
  messagesInRoom,
  MessageType,
  onlineMembersInRoom,
  publishNotification,
  relations,
  ROOM_MESSAGE_PAGE_SORT,
  ROOM_SEARCH_NEWEST_PAGE_SORT,
  ROOM_SEARCH_RANK_PAGE_SORT,
  roomsInMessage,
  roomState,
  scheduledMessagesInRoom,
  SortOrder,
  START_PAGE_CURSOR,
  unindexedMessagesInRoom,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import roomMigrations from "@esposter/db-schema/objects/room/migrations/migrations";
import { chunk, getResultAsync, getSearchExpression, noop, NotFoundError } from "@esposter/shared";
import { and, asc, count, eq, getTableColumns, gt, inArray, isNotNull, isNull, lte, max, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// The columns a message is read by.
// Its search text and its webhook delivery id stay in the row: nothing a reader is sent.
// Its tombstone time is sent only on the tombstone a delete leaves, since every reader filters deleted rows out
const {
  filenames: _filenames,
  webhookDeliveryId: _webhookDeliveryId,
  ...messageColumns
} = getTableColumns(messagesInRoom);
// The order a person's own messages are paged in for an export or an erase: oldest first
const USER_MESSAGE_PAGE_SORT = { keys: ["id"], order: SortOrder.Asc } as const satisfies PageSort<"id">;
// The order reactions are paged in: by the message each is on, then by its emoji, which together are the reaction's key
const REACTION_PAGE_SORT = { keys: ["messageId", "emojiTag"], order: SortOrder.Asc } as const satisfies PageSort<
  "emojiTag" | "messageId"
>;
// What a change to one live message sets, written by `#updateLiveMessage`, which moves its updatedAt. A delete tombstones
// Its rows in a bulk update of its own, `#tombstoneMessages`
type MessageUpdate = Partial<
  Pick<NewMessage, "editedAt" | "filenames" | "files" | "isPinned" | "linkPreviewResponse" | "mentions" | "message">
>;

// One Room object per room. Its SQLite holds the room's messages, their reactions and their search index.
// It also holds the scheduled messages still to send and the members online. Its sockets are the room's viewers.
// The caller authorises each write against D1 and names the actor.
// The write is applied in one synchronous turn and broadcasts exactly what it wrote
export class RoomObject extends RealtimeObject<RoomEvent> implements RoomObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, roomMigrations.migrations);
  readonly #core = drizzle(this.env.CORE, { relations });
  readonly #roomId = getObjectName(this.ctx, "RoomObject");

  addReaction({ emojiTag, messageId }: { emojiTag: string; messageId: number }, actor: RoomActor): null | RoomReaction {
    if (!this.#readLiveMessage(messageId)) return null;

    const existingReaction = this.#readReaction(messageId, emojiTag);
    if (!existingReaction) {
      const reaction = this.db
        .insert(messageEmojisInRoom)
        .values({ emojiTag, messageId, userIds: [actor.userId] })
        .returning()
        .get();
      if (reaction) this.broadcast({ data: reaction, type: "createEmoji" }, getSendOptions(actor));
      return reaction ?? null;
    }
    if (existingReaction.userIds.includes(actor.userId)) return existingReaction;

    return (
      this.#setReactors({ emojiTag, messageId }, [...existingReaction.userIds, actor.userId], getSendOptions(actor)) ??
      null
    );
  }

  // One alarm serves three jobs: the scheduled messages that have come due, the room-activity wave a message owes, and
  // The sent messages whose sender's index is still to be written
  override async alarm(): Promise<void> {
    const now = new Date();
    await this.#sendDueScheduledMessages(now);
    await this.#sendDueActivity(now);
    await this.#retryUnindexedMessages(now);
    await this.#armAlarm();
  }

  attachMember(userId: string, status: UserStatusInMessage): void {
    this.db.insert(onlineMembersInRoom).values({ userId }).onConflictDoNothing().run();
    this.setMemberStatus(status);
  }

  broadcastEvent(event: RoomEvent, options: { excludeTag?: string; tag?: string } = {}): void {
    this.broadcast(event, options);
  }

  closeSession(sessionId: string): void {
    this.closeRevokedSession(sessionId);
  }

  // A live send and a forward both come through here, so each owes the same post-write work: its sender's index, and the
  // Mention counts its text owes
  async createMessage(input: CreateRoomMessageInput, actor: RoomActor): Promise<RoomMessage> {
    const now = new Date();
    const message = this.#insertMessage(
      getMessageRow({ ...input, userId: actor.userId }, now),
      now,
      getSendOptions(actor),
    );
    // The index goes first: a refused index write leaves a retry row rather than throwing, so it cannot stop the alarm
    // From being armed, while an alarm that fails to arm would otherwise leave the message unindexed with no retry
    await this.#indexSentMessage({ createdAt: now, messageId: message.id, userId: actor.userId });
    await this.#armAlarm();
    await this.#countMentions(message, actor.userId);
    return message;
  }

  async createScheduledMessage(
    { id, message, replyToId, runAt }: { id: string; message: string; replyToId?: number | undefined; runAt: Date },
    actor: RoomActor,
  ): Promise<ScheduledRoomMessage> {
    const scheduledMessage = this.db
      .insert(scheduledMessagesInRoom)
      .values({ id, message, replyToId: replyToId ?? null, runAt, userId: actor.userId })
      .returning()
      .get();
    await this.#armAlarm();
    await this.#notifyUser(actor.userId, (user) =>
      user.addScheduledMessage({ roomId: this.#roomId, runAt, scheduledId: id }),
    );
    return scheduledMessage;
  }

  // A push is delivered at least once, and every delivery of it names the same delivery id.
  // The row is inserted under that id.
  // So a delivery that finds it already written returns the message the first one wrote, and sends nothing new
  async createWebhookMessage(input: CreateWebhookRoomMessageInput): Promise<RoomMessage> {
    const now = new Date();
    // The message keeps the avatar its push names, or else the image its webhook identity has now, so every reader names
    // The sender without the app user's row
    const appUserImage = input.appUserImage || (await this.#readAppUserImage(input.appUserId));
    const insertedMessage: RoomMessage | undefined = this.db
      .insert(messagesInRoom)
      .values(
        getMessageRow({ ...input, appUserImage, type: MessageType.Webhook, webhookDeliveryId: input.deliveryId }, now),
      )
      .onConflictDoNothing({ target: messagesInRoom.webhookDeliveryId })
      .returning(messageColumns)
      .get();
    if (!insertedMessage) return this.#readWebhookMessage(input.deliveryId);

    this.#announceMessage(insertedMessage, now, {});
    await this.#armAlarm();
    // Published only for the insert: a redelivery returned the message above and owes no second notification
    await this.#publishMessageNotification(insertedMessage);
    return insertedMessage;
  }

  // Each pending scheduled message leaves its sender's index first, and each sender drops the room's sent messages from
  // Their index, since the rows that name them go with the room. The room's storage goes only once every index has
  // Taken its removal, so a failed one leaves the room whole and the teardown is asked again. Once every index has taken
  // Its removal, the online members are told it is deleted, while the storage that knows them still stands
  async deleteAll(actor: RoomActor): Promise<void> {
    const scheduledMessages = this.db
      .select({ id: scheduledMessagesInRoom.id, userId: scheduledMessagesInRoom.userId })
      .from(scheduledMessagesInRoom)
      .all();
    const senderIds = this.db
      .selectDistinct({ userId: messagesInRoom.userId })
      .from(messagesInRoom)
      .where(isNotNull(messagesInRoom.userId))
      .all()
      .flatMap(({ userId }) => (userId === null ? [] : [userId]));
    const results = await Promise.allSettled([
      ...scheduledMessages.map(({ id, userId }) => this.#getUser(userId).removeScheduledMessage(id)),
      ...senderIds.map((senderId) => this.#getUser(senderId).removeSentMessagesInRoom(this.#roomId)),
    ]);
    const failures = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (failures.length > 0)
      throw new AggregateError(failures, `The room is kept, since ${failures.length} sender index removal(s) failed`);

    await this.notifyOnlineMembers({ data: { roomId: this.#roomId, userId: actor.userId }, type: "deleteRoom" });
    for (const webSocket of this.ctx.getWebSockets()) webSocket.close(1000, "Room deleted");
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }

  deleteFile({ fileId, id }: { fileId: string; id: number }, actor: RoomActor): FileEntity | null {
    const message = this.#readLiveMessage(id);
    if (!message || message.isForward) return null;

    const deletedFile = message.files.find((file) => file.id === fileId);
    if (!deletedFile) return null;

    const files = message.files.filter((file) => file !== deletedFile);
    const updatedMessage = this.#updateLiveMessage(id, { filenames: getFilenames(files), files }, new Date());
    this.#broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
    return deletedFile;
  }

  deleteLinkPreview(id: number, actor: RoomActor): null | RoomMessage {
    const updatedMessage = this.#updateLiveMessage(id, { linkPreviewResponse: null }, new Date());
    return this.#broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  async deleteMessage(id: number, actor: RoomActor): Promise<null | RoomMessage> {
    const message = this.#readLiveMessage(id);
    if (!message) return null;

    await this.#tombstoneMessages([message], getSendOptions(actor));
    return message;
  }

  async deleteScheduledMessage(id: string, actor: RoomActor): Promise<boolean> {
    const deletedRows = this.db
      .delete(scheduledMessagesInRoom)
      .where(and(eq(scheduledMessagesInRoom.id, id), eq(scheduledMessagesInRoom.userId, actor.userId)))
      .returning()
      .all();
    if (deletedRows.length === 0) return false;

    await this.#armAlarm();
    await this.#notifyUser(actor.userId, (user) => user.removeScheduledMessage(id));
    return true;
  }

  async deleteUserMessages({
    after,
    limit,
    userId,
  }: {
    after?: number | undefined;
    limit: number;
    userId: string;
  }): Promise<RoomMessage[]> {
    const messages = this.#readUserMessagePage({ after, limit, userId });
    await this.#tombstoneMessages(messages, {});
    return messages;
  }

  deleteUserReactions({
    after,
    limit,
    userId,
  }: {
    after?: RoomReactionKey | undefined;
    limit: number;
    userId: string;
  }): RoomReaction[] {
    const reactions = this.#readUserReactionPage({ after, limit, userId });
    for (const reaction of reactions) this.#removeReactor(reaction, userId, {});
    return reactions;
  }

  detachMember(userId: string, status: UserStatusInMessage): void {
    this.db.delete(onlineMembersInRoom).where(eq(onlineMembersInRoom.userId, userId)).run();
    this.setMemberStatus(status);
  }

  exportUserMessages({
    after,
    limit,
    userId,
  }: {
    after?: number | undefined;
    limit: number;
    userId: string;
  }): RoomMessage[] {
    return this.#readUserMessagePage({ after, limit, userId });
  }

  exportUserReactions({
    after,
    limit,
    userId,
  }: {
    after?: RoomReactionKey | undefined;
    limit: number;
    userId: string;
  }): RoomReaction[] {
    return this.#readUserReactionPage({ after, limit, userId });
  }

  // The members attached here are the ones a room-list event reaches, so a member who has left is not sent the event
  async notifyOnlineMembers(event: UserEvent): Promise<void> {
    const onlineMembers = this.db.select().from(onlineMembersInRoom).all();
    const results = await Promise.allSettled(
      onlineMembers.map(({ userId }) => this.#getUser(userId).broadcastEvent(event)),
    );
    for (const result of results) if (result.status === "rejected") console.error(result.reason);
  }

  pinMessage(id: number, actor: RoomActor): null | RoomMessage {
    return this.#setPinned(id, true, actor);
  }

  // The live messages after the page cursor in the room's message order, at most `limit` of them. A backward cursor reads
  // The messages newer than its row, oldest first, which the caller turns back into the list's order
  readMessages({
    cursor,
    isPinned,
    limit,
  }: {
    cursor: PageCursor;
    isPinned?: boolean | undefined;
    limit: number;
  }): RoomMessage[] {
    const sort = createPageSort({ id: messagesInRoom.id }, ROOM_MESSAGE_PAGE_SORT);
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(
        and(
          isNull(messagesInRoom.deletedAt),
          isPinned ? eq(messagesInRoom.isPinned, true) : undefined,
          getPageWhere(sort, cursor),
        ),
      )
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit)
      .all();
  }

  readMessagesByIds(ids: number[]): RoomMessage[] {
    if (ids.length === 0) return [];

    const messageMap = new Map(
      this.db
        .select(messageColumns)
        .from(messagesInRoom)
        .where(and(isNull(messagesInRoom.deletedAt), inArray(messagesInRoom.id, ids)))
        .all()
        .map((message) => [message.id, message]),
    );
    return ids.flatMap((id) => {
      const message = messageMap.get(id);
      return message ? [message] : [];
    });
  }

  readReactions(messageIds: number[]): RoomReaction[] {
    if (messageIds.length === 0) return [];

    return this.db.select().from(messageEmojisInRoom).where(inArray(messageEmojisInRoom.messageId, messageIds)).all();
  }

  // The named scheduled messages of one person, soonest first. A id the room holds for someone else is left out
  readScheduledMessages({ ids, userId }: { ids: string[]; userId: string }): ScheduledRoomMessage[] {
    if (ids.length === 0) return [];

    return this.db
      .select()
      .from(scheduledMessagesInRoom)
      .where(and(eq(scheduledMessagesInRoom.userId, userId), inArray(scheduledMessagesInRoom.id, ids)))
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .all();
  }

  readThread(threadRootId: number): RoomMessage[] {
    const replies = this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(isNull(messagesInRoom.deletedAt), eq(messagesInRoom.replyToId, threadRootId)))
      .orderBy(asc(messagesInRoom.id))
      .all();
    const root = this.#readLiveMessage(threadRootId);
    return root ? [root, ...replies] : replies;
  }

  // A member who is no longer in the room is no longer online in it, and their sockets here are dropped
  removeMember(userId: string): void {
    this.db.delete(onlineMembersInRoom).where(eq(onlineMembersInRoom.userId, userId)).run();
    for (const webSocket of this.ctx.getWebSockets(`user:${userId}`))
      webSocket.close(ROOM_MEMBER_REMOVED_CODE, "Removed from the room");
  }

  removeReaction({ emojiTag, messageId }: { emojiTag: string; messageId: number }, actor: RoomActor): boolean {
    const reaction = this.#readReaction(messageId, emojiTag);
    if (!reaction?.userIds.includes(actor.userId)) return false;

    this.#removeReactor(reaction, actor.userId, getSendOptions(actor));
    return true;
  }

  // With text, the matches are ranked within this room by bm25, with the message weighted 3, the file names 1 and the
  // Sender 1.5, and each rank is the match's position in the room. A page is the matches after its cursor in the rank,
  // Room and id order, so the rooms' matches interleave turn about. Without text, the matches are the filters' rows,
  // Newest first by time and then id. The count is read only when asked for
  searchMessages({ cursor, filters, isCounted, limit, query }: RoomSearchInput): RoomSearchResult {
    const where = and(isNull(messagesInRoom.deletedAt), ...getRoomSearchConditions(filters));
    const expression = getSearchExpression(query);
    if (!expression) {
      const sort = createPageSort(
        { createdAt: messagesInRoom.createdAt, id: messagesInRoom.id, roomId: sql`${this.#roomId}` },
        ROOM_SEARCH_NEWEST_PAGE_SORT,
      );
      const messages = this.db
        .select(messageColumns)
        .from(messagesInRoom)
        .where(and(where, getPageWhere(sort, cursor)))
        .orderBy(...getPageOrderBy(sort, cursor))
        .limit(limit)
        .all();
      const [total] = isCounted ? this.db.select({ count: count() }).from(messagesInRoom).where(where).all() : [];
      return { count: total?.count ?? 0, messages: messages.map((message) => ({ ...message, rank: null })) };
    }

    const sort = createPageSort(
      { id: sql`ranked.id`, rank: sql`ranked.rank`, roomId: sql`${this.#roomId}` },
      ROOM_SEARCH_RANK_PAGE_SORT,
    );
    const pageWhere = getPageWhere(sort, cursor);
    const ranked = this.db.all<{ id: number; rank: number }>(sql`
      select ranked.id as id, ranked.rank as rank
      from (
        select ${messagesInRoom.id} as id,
          row_number() over (order by bm25(messages_search, 3, 1, 1.5), ${messagesInRoom.createdAt} desc, ${messagesInRoom.id} desc) as rank
        from ${messagesInRoom}
        join messages_search on messages_search.rowid = ${messagesInRoom.id}
        where messages_search match ${expression} and ${where}
      ) as ranked
      where ${pageWhere ?? sql`1`}
      order by ${sql.join(getPageOrderBy(sort, cursor), sql`, `)}
      limit ${limit}`);
    const [total] = isCounted
      ? this.db.all<{ count: number }>(sql`
          select count(*) as count
          from ${messagesInRoom}
          join messages_search on messages_search.rowid = ${messagesInRoom.id}
          where messages_search match ${expression} and ${where}`)
      : [];
    const idRankMap = new Map(ranked.map(({ id, rank }) => [id, rank]));
    return {
      count: total?.count ?? 0,
      messages: this.readMessagesByIds(ranked.map(({ id }) => id)).map((message) => ({
        ...message,
        rank: idRankMap.get(message.id) ?? null,
      })),
    };
  }

  setMemberStatus(status: UserStatusInMessage): void {
    this.broadcast({ data: status, type: "upsertStatus" });
  }

  unpinMessage(id: number, actor: RoomActor): null | RoomMessage {
    return this.#setPinned(id, false, actor);
  }

  // The edit names the members its new text names, as a send does. The message's type is read first, since a webhook's
  // Edit names nobody
  updateMessage({ id, message }: { id: number; message: string }, actor: RoomActor): null | RoomMessage {
    const existingMessage = this.#readLiveMessage(id);
    if (!existingMessage) return null;

    const now = new Date();
    const mentions = getMessageMentions(message, existingMessage.type);
    const updatedMessage = this.#updateLiveMessage(id, { editedAt: now, mentions, message }, now);
    return this.#broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  async updateScheduledMessage(
    { id, message, replyToId, runAt }: { id: string; message: string; replyToId?: number | undefined; runAt: Date },
    actor: RoomActor,
  ): Promise<null | ScheduledRoomMessage> {
    const scheduledMessage = this.db
      .update(scheduledMessagesInRoom)
      .set({ message, replyToId: replyToId ?? null, runAt })
      .where(and(eq(scheduledMessagesInRoom.id, id), eq(scheduledMessagesInRoom.userId, actor.userId)))
      .returning()
      .get();
    if (!scheduledMessage) return null;

    await this.#armAlarm();
    await this.#notifyUser(actor.userId, (user) =>
      user.addScheduledMessage({ roomId: this.#roomId, runAt, scheduledId: id }),
    );
    return scheduledMessage;
  }

  votePoll({ id, optionId }: { id: number; optionId?: string | undefined }, actor: RoomActor): null | RoomMessage {
    const poll = this.#readLiveMessage(id);
    if (!poll || poll.type !== MessageType.Poll) return null;

    const votedMessage = applyPollVote(poll.message, actor.userId, optionId);
    if (votedMessage === undefined) return null;

    const updatedMessage = this.#updateLiveMessage(id, { message: votedMessage }, new Date());
    return this.#broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  // A socket that connects with the id it last heard is replayed every live message after it, oldest first.
  // It hears anything live only after that replay.
  // Replay is bounded, so a long absence leaves the rest to the client's own refresh
  protected override onSocketAccepted(server: WebSocket, request: Request): void {
    const after = new URL(request.url).searchParams.get("after");
    if (after === null) return;

    const afterId = Number(after);
    if (!Number.isSafeInteger(afterId) || afterId < 0) return;

    const missedMessages = this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(isNull(messagesInRoom.deletedAt), gt(messagesInRoom.id, afterId)))
      .orderBy(asc(messagesInRoom.id))
      .limit(MESSAGE_REPLAY_LIMIT)
      .all();
    for (const batch of chunk(missedMessages, MESSAGE_BATCH_MAX_LENGTH))
      this.sendEvent(server, { data: batch, type: "createMessage" });
  }

  // Whether the sender's index took the message. The index's write is idempotent, so a repeat of one that landed changes nothing
  async #addSentMessage({
    createdAt,
    messageId,
    userId,
  }: {
    createdAt: Date;
    messageId: number;
    userId: string;
  }): Promise<boolean> {
    const indexed = await getResultAsync(() =>
      this.#getUser(userId).addSentMessage({ createdAt, messageId, roomId: this.#roomId }),
    );
    return indexed.match(
      () => true,
      (error) => {
        console.error(error);
        return false;
      },
    );
  }

  #announceMessage(message: RoomMessage, now: Date, sendOptions: SendOptions): void {
    this.broadcast({ data: [message], type: "createMessage" }, sendOptions);
    this.#markRoomActive(now);
  }

  // The alarm is the earliest of the room-activity wave owed, the next scheduled message due and the next index retry,
  // So one alarm serves all of them
  async #armAlarm(): Promise<void> {
    const [nextScheduledMessage] = this.db
      .select({ runAt: scheduledMessagesInRoom.runAt })
      .from(scheduledMessagesInRoom)
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .limit(1)
      .all();
    const [nextIndexRetry] = this.db
      .select({ retryAt: unindexedMessagesInRoom.retryAt })
      .from(unindexedMessagesInRoom)
      .orderBy(asc(unindexedMessagesInRoom.retryAt))
      .limit(1)
      .all();
    const dueTimes = [this.#readRoomState()?.bumpDueAt, nextScheduledMessage?.runAt, nextIndexRetry?.retryAt].flatMap(
      (dueAt) => (dueAt ? [dueAt.getTime()] : []),
    );
    if (dueTimes.length > 0) await this.ctx.storage.setAlarm(Math.min(...dueTimes));
    else await this.ctx.storage.deleteAlarm();
  }

  #broadcastMessageUpdate(message: RoomMessage | undefined, sendOptions: SendOptions): null | RoomMessage {
    if (!message) return null;

    this.broadcast({ data: message, type: "updateMessage" }, sendOptions);
    return message;
  }

  // The rules a live send is held to, decided from D1 now on the sender's slowmode clock, which the send claims in the same
  // Guarded write a live send takes. A rule that rejects, and a read or claim that faults, both drop the scheduled
  // Message. A fault is logged, and a message is never sent on a decision that did not pass
  async #claimSendSlot(userId: string, message: string, now: Date): Promise<boolean> {
    const claim = await getResultAsync(() => claimMessageSendSlot(this.#core, userId, this.#roomId, message, now));
    return claim.match(
      (rejection) => rejection === undefined,
      (error) => {
        console.error(error);
        return false;
      },
    );
  }

  // The mention counts a message owes its members, written after the message is and sent to each member they reach
  // Through that member's own object, so the count shows with no new subscription. A failed count loses badges, never the
  // Message. Only a text message counts, as only a text message names members (getMessageMentions): a poll's body is its JSON
  async #countMentions(message: RoomMessage, userId: string): Promise<void> {
    if (message.type !== MessageType.Message) return;

    const mentionedRows = await getResultAsync(() =>
      incrementMentionCounts(this.#core, { message: message.message, roomId: this.#roomId, userId }),
    ).match(
      (rows) => rows,
      (error) => {
        console.error(error);
        return [];
      },
    );
    await Promise.all(
      mentionedRows.map((mentionedRow) =>
        this.#notifyUser(mentionedRow.userId, (user) => user.updateUserToRoom(mentionedRow)),
      ),
    );
  }

  #getUser(userId: string) {
    return this.env.USER.get(this.env.USER.idFromName(userId));
  }

  // The sender's index takes each message it sent. A write that fails is kept as an unindexed message, which the alarm asks
  // For again, so the sender's sent list is repaired rather than left without the message
  async #indexSentMessage(sentMessage: { createdAt: Date; messageId: number; userId: string }): Promise<void> {
    if (await this.#addSentMessage(sentMessage)) return;

    this.db
      .insert(unindexedMessagesInRoom)
      .values({
        createdAt: sentMessage.createdAt,
        messageId: sentMessage.messageId,
        retryAt: new Date(Date.now() + WRITE_RETRY_DELAY_MS),
        userId: sentMessage.userId,
      })
      .onConflictDoNothing()
      .run();
    await this.#armAlarm();
  }

  // A message is written and broadcast in one synchronous turn, and marks the room active for the fan-out it owes
  #insertMessage(values: NewMessage, now: Date, sendOptions: SendOptions): RoomMessage {
    const message = this.db.insert(messagesInRoom).values(values).returning(messageColumns).get();
    this.#announceMessage(message, now, sendOptions);
    return message;
  }

  #markRoomActive(now: Date): void {
    this.#setBumpDueAt(this.#readRoomState()?.bumpDueAt ?? new Date(now.getTime() + ROOM_ACTIVITY_DELAY_MS));
  }

  // The sender has read the room through their own message. Best-effort after the write: the message has landed, so a
  // Failed read clock costs an unread badge, never the send
  async #markSenderRead(userId: string, now: Date): Promise<void> {
    await getResultAsync(async () =>
      this.#core
        .update(usersToRoomsInMessage)
        .set({ lastReadAt: now })
        .where(and(eq(usersToRoomsInMessage.roomId, this.#roomId), eq(usersToRoomsInMessage.userId, userId))),
    ).match(noop, console.error);
  }

  async #notifyUser(userId: string, notify: NotifyUser): Promise<void> {
    await getResultAsync(() => notify(this.#getUser(userId))).match(noop, console.error);
  }

  // The notification a written message owes its recipients, published best-effort after the write.
  // A failed publish costs one notification, never the message that landed
  async #publishMessageNotification(message: RoomMessage): Promise<void> {
    await getResultAsync(() =>
      publishNotification(this.env.PROCESS_NOTIFICATION_QUEUE, {
        appUserId: message.appUserId ?? undefined,
        message: { id: message.id, message: message.message, roomId: this.#roomId, userId: message.userId },
        threadRootId: message.replyToId,
        type: AppNotificationType.Message,
      }),
    ).match(noop, console.error);
  }

  // A read that faults leaves the message without an image, never without the message.
  // The fault is logged, and the write goes on
  async #readAppUserImage(appUserId: string): Promise<string> {
    const appUser = await getResultAsync(async () =>
      this.#core
        .select({ image: appUsersInMessage.image })
        .from(appUsersInMessage)
        .where(eq(appUsersInMessage.id, appUserId))
        .get(),
    );
    return appUser.match(
      (row) => row?.image || "",
      (error) => {
        console.error(error);
        return "";
      },
    );
  }

  // The room's last message is the newest row's time. Rows leave only with the whole room, so the newest row is the last
  // Message sent, and the index on the time serves its maximum
  #readLastMessageAt(): Date | null {
    const [lastMessage] = this.db
      .select({ createdAt: max(messagesInRoom.createdAt) })
      .from(messagesInRoom)
      .all();
    return lastMessage?.createdAt ?? null;
  }

  #readLiveMessage(id: number): RoomMessage | undefined {
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .get();
  }

  #readReaction(messageId: number, emojiTag: string): RoomReaction | undefined {
    return this.db
      .select()
      .from(messageEmojisInRoom)
      .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
      .get();
  }

  #readRoomState() {
    return this.db.select().from(roomState).where(eq(roomState.id, ROOM_STATE_ID)).get();
  }

  // The author of a reply's thread root, which its follows name. A deleted root, or a webhook root, names nobody
  #readThreadRootUserId(threadRootId: null | number): string | undefined {
    if (threadRootId === null) return undefined;

    return this.#readLiveMessage(threadRootId)?.userId ?? undefined;
  }

  // A page of a person's live messages in the room, oldest first, from the id after the one named
  #readUserMessagePage({
    after,
    limit,
    userId,
  }: {
    after?: number | undefined;
    limit: number;
    userId: string;
  }): RoomMessage[] {
    const cursor: PageCursor = after === undefined ? START_PAGE_CURSOR : { isBackward: false, values: [after] };
    const sort = createPageSort({ id: messagesInRoom.id }, USER_MESSAGE_PAGE_SORT);
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(isNull(messagesInRoom.deletedAt), eq(messagesInRoom.userId, userId), getPageWhere(sort, cursor)))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit)
      .all();
  }

  // A page of the reactions a person is one of the reactors of, in key order after the key named
  #readUserReactionPage({
    after,
    limit,
    userId,
  }: {
    after?: RoomReactionKey | undefined;
    limit: number;
    userId: string;
  }): RoomReaction[] {
    const cursor: PageCursor = after
      ? { isBackward: false, values: [after.messageId, after.emojiTag] }
      : START_PAGE_CURSOR;
    const sort = createPageSort(
      { emojiTag: messageEmojisInRoom.emojiTag, messageId: messageEmojisInRoom.messageId },
      REACTION_PAGE_SORT,
    );
    return this.db
      .select()
      .from(messageEmojisInRoom)
      .where(and(getReactedByWhere(userId), getPageWhere(sort, cursor)))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit)
      .all();
  }

  // The message a push's delivery id wrote. A deleted one is still read, since its tombstone keeps the id
  #readWebhookMessage(webhookDeliveryId: string): RoomMessage {
    const message = this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(eq(messagesInRoom.webhookDeliveryId, webhookDeliveryId))
      .get();
    if (!message) throw new NotFoundError(DatabaseEntityType.Message, webhookDeliveryId);

    return message;
  }

  #removeReactor(reaction: RoomReaction, userId: string, sendOptions: SendOptions): void {
    const { emojiTag, messageId } = reaction;
    if (reaction.userIds.length === 1) {
      this.db
        .delete(messageEmojisInRoom)
        .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
        .run();
      this.broadcast({ data: { emojiTag, messageId }, type: "deleteEmoji" }, sendOptions);
      return;
    }

    this.#setReactors(
      { emojiTag, messageId },
      reaction.userIds.filter((reactorId) => reactorId !== userId),
      sendOptions,
    );
  }

  // The sent messages whose sender's index has not taken them are asked again once their retry is due. An index that takes
  // The message clears its retry, and one that refuses it again is asked again later
  async #retryUnindexedMessages(now: Date): Promise<void> {
    const dueMessages = this.db
      .select()
      .from(unindexedMessagesInRoom)
      .where(lte(unindexedMessagesInRoom.retryAt, now))
      .all();
    for (const { createdAt, messageId, userId } of dueMessages) {
      const isIndexed = await this.#addSentMessage({ createdAt, messageId, userId });
      if (isIndexed)
        this.db.delete(unindexedMessagesInRoom).where(eq(unindexedMessagesInRoom.messageId, messageId)).run();
      else
        this.db
          .update(unindexedMessagesInRoom)
          .set({ retryAt: new Date(now.getTime() + WRITE_RETRY_DELAY_MS) })
          .where(eq(unindexedMessagesInRoom.messageId, messageId))
          .run();
    }
  }

  // The room-activity wave runs once per window: the room's lastMessageAt is written in D1.
  // Every member online hears of it, each through its own user object.
  // The wave is taken before its write awaits, so a message sent meanwhile marks the room active again and owes its own
  // Wave. A failed write is due again after a delay, unless that later wave already is; a failed member is logged, never
  // A reason to hold the others
  async #sendDueActivity(now: Date): Promise<void> {
    const state = this.#readRoomState();
    if (!state?.bumpDueAt || state.bumpDueAt.getTime() > now.getTime()) return;

    const lastMessageAt = this.#readLastMessageAt();
    if (!lastMessageAt) return;

    this.#setBumpDueAt(null);
    const isWritten = await getResultAsync(async () =>
      this.#core.update(roomsInMessage).set({ lastMessageAt }).where(eq(roomsInMessage.id, this.#roomId)),
    ).match(
      () => true,
      (error) => {
        console.error(error);
        return false;
      },
    );
    if (!isWritten) {
      this.#setBumpDueAt(this.#readRoomState()?.bumpDueAt ?? new Date(now.getTime() + WRITE_RETRY_DELAY_MS));
      return;
    }

    const onlineMembers = this.db.select().from(onlineMembersInRoom).all();
    const results = await Promise.allSettled(
      onlineMembers.map(({ userId }) => this.#getUser(userId).roomActivity(this.#roomId, lastMessageAt)),
    );
    for (const result of results) if (result.status === "rejected") console.error(result.reason);
  }

  // Each due row is removed in the same transaction that writes its message, so it is sent once or dropped once.
  // The send is held to the rules a live send is, as its sender stands now, and it claims the sender's slowmode clock
  // Before its message is written, as a live send does. A row whose sender may no longer send, or whose claim faults, is dropped
  async #sendDueScheduledMessages(now: Date): Promise<void> {
    const dueMessages = this.db
      .select()
      .from(scheduledMessagesInRoom)
      .where(lte(scheduledMessagesInRoom.runAt, now))
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .all();
    for (const { id, message, replyToId, userId } of dueMessages) {
      const linkPreviewResponse = await getLinkPreviewResponse(message);
      // The claim is the last await before the write, so nothing a send does not own lands between the decision and it
      const isClaimed = await this.#claimSendSlot(userId, message, now);
      const sentMessage = this.db.transaction((transaction) => {
        transaction.delete(scheduledMessagesInRoom).where(eq(scheduledMessagesInRoom.id, id)).run();
        return isClaimed
          ? this.#insertMessage(
              getMessageRow(
                { linkPreviewResponse, message, replyToId: replyToId ?? undefined, type: MessageType.Message, userId },
                now,
              ),
              now,
              {},
            )
          : undefined;
      });
      await this.#notifyUser(userId, (user) => user.removeScheduledMessage(id));
      if (!sentMessage) continue;

      await this.#markSenderRead(userId, now);
      await this.#indexSentMessage({ createdAt: now, messageId: sentMessage.id, userId });
      await this.#countMentions(sentMessage, userId);
      // What a live reply owes after its write, in its order: the thread follows.
      // That comes strictly before the notification that resolves the thread's followers.
      // Both are best-effort, since the message already landed
      await getResultAsync(() =>
        createReplyThreadFollows(this.#core, {
          message: sentMessage,
          roomId: this.#roomId,
          threadRootUserId: this.#readThreadRootUserId(sentMessage.replyToId),
        }),
      ).match(noop, console.error);
      await this.#publishMessageNotification(sentMessage);
    }
  }

  #setBumpDueAt(bumpDueAt: Date | null): void {
    this.db
      .insert(roomState)
      .values({ bumpDueAt, id: ROOM_STATE_ID })
      .onConflictDoUpdate({ set: { bumpDueAt }, target: roomState.id })
      .run();
  }

  #setPinned(id: number, isPinned: boolean, actor: RoomActor): null | RoomMessage {
    const updatedMessage = this.#updateLiveMessage(id, { isPinned }, new Date());
    return this.#broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  // Writes a reaction's reactors and tells the room they changed, so every change to a reaction is broadcast the same way
  #setReactors(
    { emojiTag, messageId }: { emojiTag: string; messageId: number },
    userIds: string[],
    sendOptions: SendOptions,
  ): RoomReaction | undefined {
    const reaction = this.db
      .update(messageEmojisInRoom)
      .set({ userIds })
      .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
      .returning()
      .get();
    if (reaction) this.broadcast({ data: reaction, type: "updateEmoji" }, sendOptions);
    return reaction;
  }

  // A deleted message keeps its row, so a reply still names a root that exists.
  // But it loses what it said: its text, its files and its link preview leave the row and the search index.
  // Its reactions go with it. A page is tombstoned in one statement, and each sender's index is told once for the page
  async #tombstoneMessages(messages: RoomMessage[], sendOptions: SendOptions): Promise<void> {
    if (messages.length === 0) return;

    const now = new Date();
    const messageIds = messages.map(({ id }) => id);
    // The tombstone is what every viewer is sent, so a client replaces the message it holds with the row as it now is
    const tombstones = this.db
      .update(messagesInRoom)
      .set({ deletedAt: now, filenames: "", files: [], linkPreviewResponse: null, message: "", updatedAt: now })
      .where(inArray(messagesInRoom.id, messageIds))
      .returning(messageColumns)
      .all();
    this.db.delete(messageEmojisInRoom).where(inArray(messageEmojisInRoom.messageId, messageIds)).run();
    for (const tombstone of tombstones) this.broadcast({ data: tombstone, type: "deleteMessage" }, sendOptions);

    const userIdMessageIdsMap = new Map<string, number[]>();
    for (const { id, userId } of messages)
      if (userId !== null) userIdMessageIdsMap.set(userId, [...(userIdMessageIdsMap.get(userId) ?? []), id]);
    await Promise.all(
      Array.from(userIdMessageIdsMap, ([userId, userMessageIds]) =>
        this.#notifyUser(userId, (user) =>
          user.removeSentMessages({ messageIds: userMessageIds, roomId: this.#roomId }),
        ),
      ),
    );
  }

  // Every change to one live message goes through here, and each moves its updatedAt, as a tombstone's bulk update does.
  // A reconnect finds the changes it missed by that token, so a change that leaves it where it was is one it never sees
  #updateLiveMessage(id: number, values: MessageUpdate, now: Date): RoomMessage | undefined {
    return this.db
      .update(messagesInRoom)
      .set({ ...values, updatedAt: now })
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .returning(messageColumns)
      .get();
  }
}
