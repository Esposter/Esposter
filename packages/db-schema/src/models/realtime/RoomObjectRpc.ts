import type { Filter } from "#src/models/message/filter/Filter";
import type { FileEntity } from "#src/models/streams/FileEntity";
import type { RoomEvent } from "#src/models/realtime/RoomEvent";
import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { RoomReaction } from "#src/models/realtime/RoomReaction";
import type { UserStatusInMessage } from "#src/schema/message/userStatusesInMessage";

// Who a write is done as. The device, when named, is the one whose own socket is not sent the write's echo
export interface RoomActor {
  deviceId?: string;
  userId: string;
}

export interface CreateRoomMessageInput {
  files?: FileEntity[];
  isForward?: boolean;
  linkPreviewResponse?: RoomMessage["linkPreviewResponse"];
  mentions?: string[];
  message: string;
  replyToId?: number;
  type: RoomMessage["type"];
}

export interface CreateWebhookRoomMessageInput {
  appUserId: string;
  files?: FileEntity[];
  message: string;
  replyToId?: number;
  senderName?: string;
}

export interface ScheduledRoomMessage {
  id: string;
  message: string;
  replyToId: number | null;
  runAt: Date;
  userId: string;
}

export interface RoomSearchInput {
  filters: Filter[];
  limit: number;
  offset: number;
  query: string;
}

export interface RoomSearchResult {
  count: number;
  messages: RoomMessage[];
}

// The RPC surface of a RoomObject, the one contract its class in the functions Worker and the web Worker's stubs share.
// Every method trusts the actor it names: the caller authorises against D1 first. Reads return live rows only, so a
// deleted message is never read, and a write that names a message that is not there returns null rather than throwing
export interface RoomObjectRpc {
  readMessages(input: { before?: number; limit: number }): RoomMessage[];
  readMessagesByIds(ids: number[]): RoomMessage[];
  // The thread's root, when it is still live, followed by its live replies oldest first
  readThread(threadRootId: number): RoomMessage[];
  readReactions(messageIds: number[]): RoomReaction[];
  searchMessages(input: RoomSearchInput): RoomSearchResult;
  // A user's live messages in this room, oldest first, from the id after the cursor
  exportUserMessages(input: { after?: number; limit: number; userId: string }): RoomMessage[];
  readScheduledMessages(userId: string): ScheduledRoomMessage[];

  createMessage(input: CreateRoomMessageInput, actor: RoomActor): Promise<RoomMessage>;
  createWebhookMessage(input: CreateWebhookRoomMessageInput): Promise<RoomMessage>;
  updateMessage(input: { id: number; message: string }, actor: RoomActor): RoomMessage | null;
  // Returns the message as it was before the delete, so the caller can remove the blobs its files named
  deleteMessage(id: number, actor: RoomActor): Promise<RoomMessage | null>;
  // Returns the file it removed, so the caller can remove its blob
  deleteFile(input: { fileId: string; id: number }, actor: RoomActor): FileEntity | null;
  deleteLinkPreview(id: number, actor: RoomActor): RoomMessage | null;
  pinMessage(id: number, actor: RoomActor): RoomMessage | null;
  unpinMessage(id: number, actor: RoomActor): RoomMessage | null;
  // An option id votes, and no option id withdraws the actor's vote
  votePoll(input: { id: number; optionId?: string }, actor: RoomActor): RoomMessage | null;
  // Adds the actor to the emoji's reactors on the message, creating the reaction if it is new
  addReaction(input: { emojiTag: string; messageId: number }, actor: RoomActor): RoomReaction | null;
  // Takes the actor off the emoji's reactors, deleting the reaction when the actor was its only one. False when the actor
  // was not a reactor
  removeReaction(input: { emojiTag: string; messageId: number }, actor: RoomActor): boolean;
  createScheduledMessage(
    input: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ): Promise<ScheduledRoomMessage>;
  updateScheduledMessage(
    input: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ): Promise<ScheduledRoomMessage | null>;
  deleteScheduledMessage(id: string, actor: RoomActor): Promise<boolean>;

  // The person-level writes, for a moderation action or an account erase the caller has already authorised. Deleting the
  // messages returns them as they were, so the caller can remove the blobs their files named
  deleteUserMessages(userId: string): Promise<RoomMessage[]>;
  deleteUserReactions(userId: string): void;
  deleteAll(): Promise<void>;

  // A member's presence in the room: its online set, the status each change sends the room's viewers, and a removed
  // member's sockets dropped
  attachMember(userId: string, status: UserStatusInMessage): void;
  detachMember(userId: string, status: UserStatusInMessage): void;
  removeMember(userId: string): void;
  // A status the person set, which every room they are in shows
  setMemberStatus(status: UserStatusInMessage): void;
  // A room event the caller raised from D1's own changes, sent to the sockets a tag names, or to every socket
  broadcastEvent(event: RoomEvent, options?: { excludeTag?: string; tag?: string }): void;
}
