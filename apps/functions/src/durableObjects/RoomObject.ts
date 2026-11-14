import type { UserStatusInMessage } from "@esposter/db-schema";
import type {
  CreateRoomMessageInput,
  CreateWebhookRoomMessageInput,
  FileEntity,
  LinkPreviewResponse,
  RoomActor,
  RoomEvent,
  RoomMessage,
  RoomObjectRpc,
  RoomReaction,
  RoomSearchInput,
  RoomSearchResult,
  ScheduledRoomMessage,
} from "@esposter/db-schema";
import type { UserObject } from "#src/durableObjects/UserObject";

import roomMigrations from "#src/durableObjects/room/migrations/migrations.js";
import {
  messageEmojisInRoom,
  messagesInRoom,
  onlineMembersInRoom,
  roomState,
  scheduledMessagesInRoom,
} from "#src/durableObjects/room/schema";
import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import {
  MESSAGE_REPLAY_LIMIT,
  ROOM_ACTIVITY_DELAY_MS,
  ROOM_MEMBER_REMOVED_CODE,
  ROOM_STATE_ID,
} from "#src/services/room/constants";
import { applyPollVote } from "#src/services/room/applyPollVote";
import { getRoomSearchConditions } from "#src/services/room/getRoomSearchConditions";
import { createReplyThreadFollows, getMessageCreationRejection } from "@esposter/db";
import {
  AppNotificationType,
  appUsersInMessage,
  MessageType,
  publishNotification,
  MESSAGE_BATCH_MAX_LENGTH,
  relations,
  roomsInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { chunk, getResultAsync, getSearchExpression, noop, NotInitializedError } from "@esposter/shared";
import { and, asc, count, desc, eq, getTableColumns, gt, inArray, isNull, lt, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// The columns a message is read by. Its search text stays in the row: nothing a reader is sent. Its tombstone time is sent
// only on the tombstone a delete leaves, since every reader filters deleted rows out
const { filenames: _filenames, ...messageColumns } = getTableColumns(messagesInRoom);

type NewMessage = typeof messagesInRoom.$inferInsert;
type SendOptions = { excludeTag?: string };
type NotifyUser = (user: DurableObjectStub<UserObject>) => unknown;

// The fields a message is written from, whichever kind of sender wrote it
interface MessageFields {
  appUserId?: string;
  appUserImage?: string;
  files?: FileEntity[];
  isForward?: boolean;
  linkPreviewResponse?: LinkPreviewResponse | null;
  mentions?: string[];
  message: string;
  replyToId?: number;
  senderName?: string;
  type: MessageType;
  userId?: string;
}

const getFilenames = (files: FileEntity[]): string => files.map(({ filename }) => filename).join(" ");

const getMessageRow = (
  {
    appUserId,
    appUserImage = "",
    files = [],
    isForward = false,
    linkPreviewResponse = null,
    mentions = [],
    message,
    replyToId,
    senderName,
    type,
    userId,
  }: MessageFields,
  now: Date,
): NewMessage => ({
  appUserId: appUserId ?? null,
  appUserImage,
  createdAt: now,
  files,
  filenames: getFilenames(files),
  isEdited: false,
  isForward,
  isPinned: false,
  linkPreviewResponse,
  mentions,
  message,
  replyToId: replyToId ?? null,
  senderName: senderName ?? null,
  type,
  updatedAt: now,
  userId: userId ?? null,
});

// A write from a device excludes that device's own socket, so the device that made it does not hear its echo
const getSendOptions = ({ deviceId }: RoomActor): SendOptions =>
  deviceId === undefined ? {} : { excludeTag: `device:${deviceId}` };

// A room's object is named for its room, so the name is the room the object holds
const getRoomId = ({ id }: DurableObjectState): string => {
  if (id.name === undefined) throw new NotInitializedError("RoomObject");
  return id.name;
};

// One Room object per room. Its SQLite holds the room's messages, their reactions and their search index, the scheduled
// messages still to send and the members online. Its sockets are the room's viewers. The caller authorises each write
// against D1 and names the actor; the write is applied in one synchronous turn and broadcasts exactly what it wrote
export class RoomObject extends RealtimeObject<RoomEvent> implements RoomObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, roomMigrations.migrations);
  private readonly core = drizzle(this.env.CORE, { relations });
  private readonly roomId = getRoomId(this.ctx);

  // One alarm serves two jobs: the scheduled messages that have come due, and the room-activity wave a message owes
  override async alarm(): Promise<void> {
    const now = new Date();
    await this.sendDueScheduledMessages(now);
    await this.sendDueActivity(now);
    await this.armAlarm();
  }

  // A socket that connects with the id it last heard is replayed every live message after it, oldest first, before it
  // hears anything live. Replay is bounded, so a long absence leaves the rest to the client's own refresh
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
      server.send(JSON.stringify({ data: batch, type: "createMessage" } satisfies RoomEvent));
  }

  readMessages({ before, isPinned, limit }: { before?: number; isPinned?: boolean; limit: number }): RoomMessage[] {
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(
        and(
          isNull(messagesInRoom.deletedAt),
          before === undefined ? undefined : lt(messagesInRoom.id, before),
          isPinned ? eq(messagesInRoom.isPinned, true) : undefined,
        ),
      )
      .orderBy(desc(messagesInRoom.id))
      .limit(limit)
      .all();
  }

  readMessagesByIds(ids: number[]): RoomMessage[] {
    if (ids.length === 0) return [];

    const messagesById = new Map(
      this.db
        .select(messageColumns)
        .from(messagesInRoom)
        .where(and(isNull(messagesInRoom.deletedAt), inArray(messagesInRoom.id, ids)))
        .all()
        .map((message) => [message.id, message]),
    );
    return ids.flatMap((id) => {
      const message = messagesById.get(id);
      return message ? [message] : [];
    });
  }

  readThread(threadRootId: number): RoomMessage[] {
    const replies = this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(isNull(messagesInRoom.deletedAt), eq(messagesInRoom.replyToId, threadRootId)))
      .orderBy(asc(messagesInRoom.id))
      .all();
    const root = this.readLiveMessage(threadRootId);
    return root ? [root, ...replies] : replies;
  }

  readReactions(messageIds: number[]): RoomReaction[] {
    if (messageIds.length === 0) return [];

    return this.db.select().from(messageEmojisInRoom).where(inArray(messageEmojisInRoom.messageId, messageIds)).all();
  }

  exportUserReactions(userId: string): RoomReaction[] {
    return this.db
      .select()
      .from(messageEmojisInRoom)
      .all()
      .filter(({ userIds }) => userIds.includes(userId));
  }

  // With text, the rows are the index's matches narrowed by the room's live rows and the filters, ranked by bm25 with the
  // message weighted 3, the file names 1 and the sender 1.5. Without text, the rows are the filters' matches, newest first
  searchMessages({ filters, limit, offset, query }: RoomSearchInput): RoomSearchResult {
    const where = and(isNull(messagesInRoom.deletedAt), ...getRoomSearchConditions(filters));
    const expression = getSearchExpression(query);
    if (!expression) {
      const messages = this.db
        .select(messageColumns)
        .from(messagesInRoom)
        .where(where)
        .orderBy(desc(messagesInRoom.createdAt), desc(messagesInRoom.id))
        .limit(limit)
        .offset(offset)
        .all();
      const [total] = this.db.select({ count: count() }).from(messagesInRoom).where(where).all();
      return { count: total?.count ?? 0, messages };
    }

    const ranked = this.db.all<{ id: number }>(sql`
      select ${messagesInRoom.id} as id
      from ${messagesInRoom}
      join messages_search on messages_search.rowid = ${messagesInRoom.id}
      where messages_search match ${expression} and ${where}
      order by bm25(messages_search, 3, 1, 1.5), ${messagesInRoom.createdAt} desc, ${messagesInRoom.id} desc
      limit ${limit} offset ${offset}`);
    const [total] = this.db.all<{ count: number }>(sql`
      select count(*) as count
      from ${messagesInRoom}
      join messages_search on messages_search.rowid = ${messagesInRoom.id}
      where messages_search match ${expression} and ${where}`);
    return { count: total?.count ?? 0, messages: this.readMessagesByIds(ranked.map(({ id }) => id)) };
  }

  exportUserMessages({ after, limit, userId }: { after?: number; limit: number; userId: string }): RoomMessage[] {
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(
        and(
          isNull(messagesInRoom.deletedAt),
          eq(messagesInRoom.userId, userId),
          after === undefined ? undefined : gt(messagesInRoom.id, after),
        ),
      )
      .orderBy(asc(messagesInRoom.id))
      .limit(limit)
      .all();
  }

  readScheduledMessages(userId: string): ScheduledRoomMessage[] {
    return this.db
      .select()
      .from(scheduledMessagesInRoom)
      .where(eq(scheduledMessagesInRoom.userId, userId))
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .all();
  }

  async createMessage(input: CreateRoomMessageInput, actor: RoomActor): Promise<RoomMessage> {
    const now = new Date();
    const message = this.insertMessage(
      getMessageRow({ ...input, userId: actor.userId }, now),
      now,
      getSendOptions(actor),
    );
    await this.armAlarm();
    await this.notifyUser(actor.userId, (user) =>
      user.addSentMessage({ createdAt: now, messageId: message.id, roomId: this.roomId }),
    );
    return message;
  }

  async createWebhookMessage(input: CreateWebhookRoomMessageInput): Promise<RoomMessage> {
    const now = new Date();
    // The message keeps the image its webhook identity has now, so every reader names the sender without the app user's row
    const appUserImage = await this.readAppUserImage(input.appUserId);
    const message = this.insertMessage(
      getMessageRow({ ...input, appUserImage, type: MessageType.Webhook }, now),
      now,
      {},
    );
    await this.armAlarm();
    return message;
  }

  // A read that faults leaves the message without an image, never without the message: the fault is logged, and the write
  // goes on
  private async readAppUserImage(appUserId: string): Promise<string> {
    const appUser = await getResultAsync(async () =>
      this.core
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

  updateMessage(
    { id, mentions, message }: { id: number; mentions: string[]; message: string },
    actor: RoomActor,
  ): RoomMessage | null {
    const updatedMessage = this.db
      .update(messagesInRoom)
      .set({ isEdited: true, mentions, message, updatedAt: new Date() })
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .returning(messageColumns)
      .get();
    return this.broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  async deleteMessage(id: number, actor: RoomActor): Promise<RoomMessage | null> {
    const message = this.readLiveMessage(id);
    if (!message) return null;

    await this.tombstoneMessages([message], getSendOptions(actor));
    return message;
  }

  deleteFile({ fileId, id }: { fileId: string; id: number }, actor: RoomActor): FileEntity | null {
    const message = this.readLiveMessage(id);
    if (!message || message.isForward) return null;

    const deletedFile = message.files.find((file) => file.id === fileId);
    if (!deletedFile) return null;

    const files = message.files.filter((file) => file !== deletedFile);
    const updatedMessage = this.db
      .update(messagesInRoom)
      .set({ files, filenames: getFilenames(files), updatedAt: new Date() })
      .where(eq(messagesInRoom.id, id))
      .returning(messageColumns)
      .get();
    this.broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
    return deletedFile;
  }

  deleteLinkPreview(id: number, actor: RoomActor): RoomMessage | null {
    const updatedMessage = this.db
      .update(messagesInRoom)
      .set({ linkPreviewResponse: null })
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .returning(messageColumns)
      .get();
    return this.broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  pinMessage(id: number, actor: RoomActor): RoomMessage | null {
    return this.setPinned(id, true, actor);
  }

  unpinMessage(id: number, actor: RoomActor): RoomMessage | null {
    return this.setPinned(id, false, actor);
  }

  votePoll({ id, optionId }: { id: number; optionId?: string }, actor: RoomActor): RoomMessage | null {
    const poll = this.readLiveMessage(id);
    if (!poll || poll.type !== MessageType.Poll) return null;

    const votedMessage = applyPollVote(poll.message, actor.userId, optionId);
    if (votedMessage === undefined) return null;

    const updatedMessage = this.db
      .update(messagesInRoom)
      .set({ message: votedMessage })
      .where(eq(messagesInRoom.id, id))
      .returning(messageColumns)
      .get();
    return this.broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  addReaction({ emojiTag, messageId }: { emojiTag: string; messageId: number }, actor: RoomActor): RoomReaction | null {
    if (!this.readLiveMessage(messageId)) return null;

    const existingReaction = this.readReaction(messageId, emojiTag);
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

    const userIds = [...existingReaction.userIds, actor.userId];
    const reaction = this.db
      .update(messageEmojisInRoom)
      .set({ userIds })
      .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
      .returning()
      .get();
    if (reaction) this.broadcast({ data: reaction, type: "updateEmoji" }, getSendOptions(actor));
    return reaction ?? null;
  }

  removeReaction({ emojiTag, messageId }: { emojiTag: string; messageId: number }, actor: RoomActor): boolean {
    const reaction = this.readReaction(messageId, emojiTag);
    if (!reaction?.userIds.includes(actor.userId)) return false;

    this.removeReactor(reaction, actor.userId, getSendOptions(actor));
    return true;
  }

  async createScheduledMessage(
    { id, message, replyToId, runAt }: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ): Promise<ScheduledRoomMessage> {
    const scheduledMessage = this.db
      .insert(scheduledMessagesInRoom)
      .values({ id, message, replyToId: replyToId ?? null, runAt, userId: actor.userId })
      .returning()
      .get();
    await this.armAlarm();
    await this.notifyUser(actor.userId, (user) =>
      user.addScheduledMessage({ roomId: this.roomId, runAt, scheduledId: id }),
    );
    return scheduledMessage;
  }

  async updateScheduledMessage(
    { id, message, replyToId, runAt }: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ): Promise<ScheduledRoomMessage | null> {
    const scheduledMessage = this.db
      .update(scheduledMessagesInRoom)
      .set({ message, replyToId: replyToId ?? null, runAt })
      .where(and(eq(scheduledMessagesInRoom.id, id), eq(scheduledMessagesInRoom.userId, actor.userId)))
      .returning()
      .get();
    if (!scheduledMessage) return null;

    await this.armAlarm();
    await this.notifyUser(actor.userId, (user) =>
      user.addScheduledMessage({ roomId: this.roomId, runAt, scheduledId: id }),
    );
    return scheduledMessage;
  }

  async deleteScheduledMessage(id: string, actor: RoomActor): Promise<boolean> {
    const deletedRows = this.db
      .delete(scheduledMessagesInRoom)
      .where(and(eq(scheduledMessagesInRoom.id, id), eq(scheduledMessagesInRoom.userId, actor.userId)))
      .returning()
      .all();
    if (deletedRows.length === 0) return false;

    await this.armAlarm();
    await this.notifyUser(actor.userId, (user) => user.removeScheduledMessage(id));
    return true;
  }

  async deleteUserMessages(userId: string): Promise<RoomMessage[]> {
    const messages = this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(isNull(messagesInRoom.deletedAt), eq(messagesInRoom.userId, userId)))
      .all();
    await this.tombstoneMessages(messages, {});
    return messages;
  }

  deleteUserReactions(userId: string): void {
    for (const reaction of this.db.select().from(messageEmojisInRoom).all())
      if (reaction.userIds.includes(userId)) this.removeReactor(reaction, userId, {});
  }

  async deleteAll(): Promise<void> {
    for (const webSocket of this.ctx.getWebSockets()) webSocket.close(1000, "Room deleted");
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }

  attachMember(userId: string, status: UserStatusInMessage): void {
    this.db.insert(onlineMembersInRoom).values({ userId }).onConflictDoNothing().run();
    this.setMemberStatus(status);
  }

  detachMember(userId: string, status: UserStatusInMessage): void {
    this.db.delete(onlineMembersInRoom).where(eq(onlineMembersInRoom.userId, userId)).run();
    this.setMemberStatus(status);
  }

  // A member who is no longer in the room is no longer online in it, and their sockets here are dropped
  removeMember(userId: string): void {
    this.db.delete(onlineMembersInRoom).where(eq(onlineMembersInRoom.userId, userId)).run();
    for (const webSocket of this.ctx.getWebSockets(`user:${userId}`))
      webSocket.close(ROOM_MEMBER_REMOVED_CODE, "Removed from the room");
  }

  setMemberStatus(status: UserStatusInMessage): void {
    this.broadcast({ data: status, type: "upsertStatus" });
  }

  broadcastEvent(event: RoomEvent, options: { excludeTag?: string; tag?: string } = {}): void {
    this.broadcast(event, options);
  }

  // A message is written and broadcast in one synchronous turn, and marks the room active for the fan-out it owes
  private insertMessage(values: NewMessage, now: Date, sendOptions: SendOptions): RoomMessage {
    const message = this.db.insert(messagesInRoom).values(values).returning(messageColumns).get();
    this.broadcast({ data: [message], type: "createMessage" }, sendOptions);
    this.markRoomActive(now);
    return message;
  }

  private markRoomActive(now: Date): void {
    const bumpDueAt = this.readRoomState()?.bumpDueAt ?? new Date(now.getTime() + ROOM_ACTIVITY_DELAY_MS);
    this.db
      .insert(roomState)
      .values({ bumpDueAt, id: ROOM_STATE_ID, lastMessageAt: now })
      .onConflictDoUpdate({ set: { lastMessageAt: now }, target: roomState.id })
      .run();
  }

  private setPinned(id: number, isPinned: boolean, actor: RoomActor): RoomMessage | null {
    const updatedMessage = this.db
      .update(messagesInRoom)
      .set({ isPinned })
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .returning(messageColumns)
      .get();
    return this.broadcastMessageUpdate(updatedMessage, getSendOptions(actor));
  }

  private broadcastMessageUpdate(message: RoomMessage | undefined, sendOptions: SendOptions): RoomMessage | null {
    if (!message) return null;

    this.broadcast({ data: message, type: "updateMessage" }, sendOptions);
    return message;
  }

  // A deleted message keeps its row, so a reply still names a root that exists, but it loses what it said: its text, its
  // files and its link preview leave the row and the search index, and its reactions go with it
  private async tombstoneMessages(messages: RoomMessage[], sendOptions: SendOptions): Promise<void> {
    const now = new Date();
    for (const message of messages) {
      // The tombstone is what every viewer is sent, so a client replaces the message it holds with the row as it now is
      const tombstone = this.db
        .update(messagesInRoom)
        .set({ deletedAt: now, filenames: "", files: [], linkPreviewResponse: null, message: "" })
        .where(eq(messagesInRoom.id, message.id))
        .returning(messageColumns)
        .get();
      this.db.delete(messageEmojisInRoom).where(eq(messageEmojisInRoom.messageId, message.id)).run();
      if (tombstone) this.broadcast({ data: tombstone, type: "deleteMessage" }, sendOptions);
    }
    await Promise.all(
      messages.flatMap(({ id, userId }) =>
        userId === null
          ? []
          : [this.notifyUser(userId, (user) => user.removeSentMessage({ messageId: id, roomId: this.roomId }))],
      ),
    );
  }

  private removeReactor(reaction: RoomReaction, userId: string, sendOptions: SendOptions): void {
    const { emojiTag, messageId } = reaction;
    if (reaction.userIds.length === 1) {
      this.db
        .delete(messageEmojisInRoom)
        .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
        .run();
      this.broadcast({ data: { emojiTag, messageId }, type: "deleteEmoji" }, sendOptions);
      return;
    }

    const updatedReaction = this.db
      .update(messageEmojisInRoom)
      .set({ userIds: reaction.userIds.filter((reactorId) => reactorId !== userId) })
      .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
      .returning()
      .get();
    if (updatedReaction) this.broadcast({ data: updatedReaction, type: "updateEmoji" }, sendOptions);
  }

  private readLiveMessage(id: number): RoomMessage | undefined {
    return this.db
      .select(messageColumns)
      .from(messagesInRoom)
      .where(and(eq(messagesInRoom.id, id), isNull(messagesInRoom.deletedAt)))
      .get();
  }

  // The author of a reply's thread root, which its follows name. A deleted root, or a webhook root, names nobody
  private readThreadRootUserId(threadRootId: number | null): string | undefined {
    if (threadRootId === null) return undefined;

    return this.readLiveMessage(threadRootId)?.userId ?? undefined;
  }

  private readReaction(messageId: number, emojiTag: string): RoomReaction | undefined {
    return this.db
      .select()
      .from(messageEmojisInRoom)
      .where(and(eq(messageEmojisInRoom.messageId, messageId), eq(messageEmojisInRoom.emojiTag, emojiTag)))
      .get();
  }

  private readRoomState() {
    return this.db.select().from(roomState).where(eq(roomState.id, ROOM_STATE_ID)).get();
  }

  // The alarm is the earlier of the room-activity wave owed and the next scheduled message due, so one alarm serves both
  private async armAlarm(): Promise<void> {
    const [nextScheduledMessage] = this.db
      .select({ runAt: scheduledMessagesInRoom.runAt })
      .from(scheduledMessagesInRoom)
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .limit(1)
      .all();
    const dueTimes = [this.readRoomState()?.bumpDueAt, nextScheduledMessage?.runAt].flatMap((dueAt) =>
      dueAt ? [dueAt.getTime()] : [],
    );
    if (dueTimes.length > 0) await this.ctx.storage.setAlarm(Math.min(...dueTimes));
    else await this.ctx.storage.deleteAlarm();
  }

  // Each due row is removed in the same transaction that writes its message, so it is sent once or dropped once. The
  // send is held to the rules a live send is, as its sender stands now: a row whose sender may no longer send is dropped
  private async sendDueScheduledMessages(now: Date): Promise<void> {
    const dueMessages = this.db
      .select()
      .from(scheduledMessagesInRoom)
      .where(lte(scheduledMessagesInRoom.runAt, now))
      .orderBy(asc(scheduledMessagesInRoom.runAt))
      .all();
    for (const { id, message, replyToId, userId } of dueMessages) {
      const isSendable = await this.checkIsSendable(userId, message);
      const sentMessage = this.db.transaction((transaction) => {
        transaction.delete(scheduledMessagesInRoom).where(eq(scheduledMessagesInRoom.id, id)).run();
        return isSendable
          ? this.insertMessage(
              getMessageRow({ message, replyToId: replyToId ?? undefined, type: MessageType.Message, userId }, now),
              now,
              {},
            )
          : undefined;
      });
      await this.notifyUser(userId, (user) => user.removeScheduledMessage(id));
      if (!sentMessage) continue;

      await this.notifyUser(userId, (user) =>
        user.addSentMessage({ createdAt: now, messageId: sentMessage.id, roomId: this.roomId }),
      );
      // What a live reply owes after its write, in its order: the thread follows, strictly before the notification that
      // resolves the thread's followers. Both are best-effort, since the message already landed
      await getResultAsync(() =>
        createReplyThreadFollows(this.core, {
          message: sentMessage,
          roomId: this.roomId,
          threadRootUserId: this.readThreadRootUserId(sentMessage.replyToId),
        }),
      ).match(noop, console.error);
      await getResultAsync(() =>
        publishNotification(this.env.PROCESS_NOTIFICATION_QUEUE, {
          message: {
            id: sentMessage.id,
            message: sentMessage.message,
            roomId: this.roomId,
            userId: sentMessage.userId,
          },
          threadRootId: sentMessage.replyToId,
          type: AppNotificationType.Message,
        }),
      ).match(noop, console.error);
      // A scheduled send advances the sender's slowmode clock as a live one does, so it cannot slip past the room's gate
      await getResultAsync(async () =>
        this.core
          .update(usersToRoomsInMessage)
          .set({ lastMessageAt: now, lastReadAt: now })
          .where(and(eq(usersToRoomsInMessage.roomId, this.roomId), eq(usersToRoomsInMessage.userId, userId))),
      ).match(noop, console.error);
    }
  }

  // The rules are the ones a live send is held to, read from D1 now. A rule that rejects, and a read that faults, both
  // drop the scheduled message: a fault is logged, and a message is never sent on a check that did not pass
  private async checkIsSendable(userId: string, message: string): Promise<boolean> {
    const decision = await getResultAsync(() => getMessageCreationRejection(this.core, userId, this.roomId, message));
    return decision.match(
      (rejection) => rejection === undefined,
      (error) => {
        console.error(error);
        return false;
      },
    );
  }

  // The room-activity wave runs once per window: the room's updatedAt is written in D1, and every member online hears of
  // it, each through its own user object. A failed write or a failed member is logged, never a reason to hold the others
  private async sendDueActivity(now: Date): Promise<void> {
    const state = this.readRoomState();
    if (!state?.bumpDueAt || !state.lastMessageAt || state.bumpDueAt.getTime() > now.getTime()) return;

    const { lastMessageAt } = state;
    this.db.update(roomState).set({ bumpDueAt: null }).where(eq(roomState.id, ROOM_STATE_ID)).run();
    await getResultAsync(async () =>
      this.core.update(roomsInMessage).set({ updatedAt: lastMessageAt }).where(eq(roomsInMessage.id, this.roomId)),
    ).match(noop, console.error);

    const onlineMembers = this.db.select().from(onlineMembersInRoom).all();
    const results = await Promise.allSettled(
      onlineMembers.map(({ userId }) => this.getUser(userId).roomActivity(this.roomId, lastMessageAt)),
    );
    for (const result of results) if (result.status === "rejected") console.error(result.reason);
  }

  private getUser(userId: string) {
    return this.env.USER.get(this.env.USER.idFromName(userId));
  }

  private async notifyUser(userId: string, notify: NotifyUser): Promise<void> {
    await getResultAsync(async () => notify(this.getUser(userId))).match(noop, console.error);
  }
}
