import type { Filter } from "#src/models/message/filter/Filter";
import type { RoomEvent } from "#src/models/realtime/RoomEvent";
import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { RoomReaction } from "#src/models/realtime/RoomReaction";
import type { UserEvent } from "#src/models/realtime/UserEvent";
import type { FileEntity } from "#src/models/streams/FileEntity";
import type { UserStatusInMessage } from "#src/schema/message/userStatusesInMessage";

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
  // The id the push was accepted under. A delivery can be made more than once, and every one of them writes this message
  deliveryId: string;
  files?: FileEntity[];
  message: string;
  replyToId?: number;
  senderName?: string;
}

// Who a write is done as. The device, when named, is the one whose own socket is not sent the write's echo
export interface RoomActor {
  deviceId?: string;
  userId: string;
}

// The RPC surface of a RoomObject, the one contract its class in the realtime Worker and the web Worker's stubs share.
// Every method trusts the actor it names: the caller authorises against D1 first. Reads return live rows only, so a
// Deleted message is never read, and a write that names a message that is not there returns null rather than throwing
export interface RoomObjectRpc {
  // Adds the actor to the emoji's reactors on the message, creating the reaction if it is new
  addReaction: (input: { emojiTag: string; messageId: number }, actor: RoomActor) => null | RoomReaction;
  // A member's presence in the room: its online set, the status each change sends the room's viewers, and a removed
  // Member's sockets dropped
  attachMember: (userId: string, status: UserStatusInMessage) => void;
  // A room event the caller raised from D1's own changes, sent to the sockets a tag names, or to every socket
  broadcastEvent: (event: RoomEvent, options?: { excludeTag?: string; tag?: string }) => void;
  // A revoked session's sockets in this room, closed
  closeSession: (sessionId: string) => void;
  createMessage: (input: CreateRoomMessageInput, actor: RoomActor) => Promise<RoomMessage>;
  createScheduledMessage: (
    input: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ) => Promise<ScheduledRoomMessage>;
  createWebhookMessage: (input: CreateWebhookRoomMessageInput) => Promise<RoomMessage>;
  deleteAll: () => Promise<void>;
  // Returns the file it removed, so the caller can remove its blob
  deleteFile: (input: { fileId: string; id: number }, actor: RoomActor) => FileEntity | null;
  deleteLinkPreview: (id: number, actor: RoomActor) => null | RoomMessage;
  // Returns the message as it was before the delete, so the caller can remove the blobs its files named
  deleteMessage: (id: number, actor: RoomActor) => Promise<null | RoomMessage>;
  deleteScheduledMessage: (id: string, actor: RoomActor) => Promise<boolean>;
  // The person-level writes, for a moderation action or an account erase the caller has already authorised. Deleting the
  // Messages returns them as they were, so the caller can remove the blobs their files named
  deleteUserMessages: (userId: string) => Promise<RoomMessage[]>;
  deleteUserReactions: (userId: string) => void;
  detachMember: (userId: string, status: UserStatusInMessage) => void;
  // A user's live messages in this room, oldest first, from the id after the cursor
  exportUserMessages: (input: { after?: number; limit: number; userId: string }) => RoomMessage[];
  // The reactions a user is one of the reactors of in this room, each with every reactor it has
  exportUserReactions: (userId: string) => RoomReaction[];
  // A room-list event the room's own write raised, sent to each member online in the room through that member's object
  notifyOnlineMembers: (event: UserEvent) => Promise<void>;
  pinMessage: (id: number, actor: RoomActor) => null | RoomMessage;
  // Newest first before a cursor, or oldest first after one, so a jump to an older message reads both ways from it
  readMessages: (input: { after?: number; before?: number; isPinned?: boolean; limit: number }) => RoomMessage[];
  readMessagesByIds: (ids: number[]) => RoomMessage[];
  readReactions: (messageIds: number[]) => RoomReaction[];
  readScheduledMessages: (userId: string) => ScheduledRoomMessage[];
  // The thread's root, when it is still live, followed by its live replies oldest first
  readThread: (threadRootId: number) => RoomMessage[];
  removeMember: (userId: string) => void;
  // Takes the actor off the emoji's reactors, deleting the reaction when the actor was its only one. False when the actor
  // Was not a reactor
  removeReaction: (input: { emojiTag: string; messageId: number }, actor: RoomActor) => boolean;
  searchMessages: (input: RoomSearchInput) => RoomSearchResult;
  // A status the person set, which every room they are in shows
  setMemberStatus: (status: UserStatusInMessage) => void;
  unpinMessage: (id: number, actor: RoomActor) => null | RoomMessage;
  updateMessage: (input: { id: number; mentions: string[]; message: string }, actor: RoomActor) => null | RoomMessage;
  updateScheduledMessage: (
    input: { id: string; message: string; replyToId?: number; runAt: Date },
    actor: RoomActor,
  ) => Promise<null | ScheduledRoomMessage>;
  // An option id votes, and no option id withdraws the actor's vote
  votePoll: (input: { id: number; optionId?: string }, actor: RoomActor) => null | RoomMessage;
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

export interface ScheduledRoomMessage {
  id: string;
  message: string;
  replyToId: null | number;
  runAt: Date;
  userId: string;
}
