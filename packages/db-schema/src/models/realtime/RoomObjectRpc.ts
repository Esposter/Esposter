import type { Filter } from "#src/models/message/filter/Filter";
import type { PageCursor } from "#src/models/pagination/PageCursor";
import type { RoomEvent } from "#src/models/realtime/RoomEvent";
import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { RoomReaction } from "#src/models/realtime/RoomReaction";
import type { UserEvent } from "#src/models/realtime/UserEvent";
import type { FileEntity } from "#src/models/streams/FileEntity";
import type { scheduledMessagesInRoom } from "#src/objects/room/schema";
import type { UserStatusInMessage } from "#src/schema/message/userStatusesInMessage";

// The mentions a message names are read from its text by the object, so no sender can write a message whose mentions
// Disagree with its text
export interface CreateRoomMessageInput {
  files?: FileEntity[] | undefined;
  isForward?: boolean;
  linkPreviewResponse?: RoomMessage["linkPreviewResponse"];
  message: string;
  replyToId?: number | undefined;
  type: RoomMessage["type"];
}

export interface CreateWebhookRoomMessageInput {
  appUserId: string;
  // The avatar the push names. The message keeps it in place of its identity's own image when a push names one
  // The incoming webhook's avatar override, or "" for the identity's own image
  appUserImage: string;
  // The id the push was accepted under. A delivery can be made more than once, and every one of them writes this message
  deliveryId: string;
  files?: FileEntity[];
  message: string;
  replyToId?: number;
  senderName?: string | undefined;
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
    input: { id: string; message: string; replyToId?: number | undefined; runAt: Date },
    actor: RoomActor,
  ) => Promise<ScheduledRoomMessage>;
  createWebhookMessage: (input: CreateWebhookRoomMessageInput) => Promise<RoomMessage>;
  // Empties the room once every sender's index has taken its removal, and tells its online members it is deleted before
  // The storage goes. The actor is the one who deletes it
  deleteAll: (actor: RoomActor) => Promise<void>;
  // Returns the file it removed, so the caller can remove its blob
  deleteFile: (input: { fileId: string; id: number }, actor: RoomActor) => FileEntity | null;
  deleteLinkPreview: (id: number, actor: RoomActor) => null | RoomMessage;
  // Returns the message as it was before the delete, so the caller can remove the blobs its files named
  deleteMessage: (id: number, actor: RoomActor) => Promise<null | RoomMessage>;
  deleteScheduledMessage: (id: string, actor: RoomActor) => Promise<boolean>;
  // One page of a person's erase in this room: their live messages after the id named, oldest first, each tombstoned.
  // Returns the page as it was before the delete, so the caller can remove the blobs its files named. A page shorter
  // Than the limit is the last one
  deleteUserMessages: (input: { after?: number | undefined; limit: number; userId: string }) => Promise<RoomMessage[]>;
  // One page of the reactions a person is a reactor of after the key named, each with the person taken off it. Returns
  // The page as it was before the removal, so the caller reads the next key off its last reaction
  deleteUserReactions: (input: {
    after?: RoomReactionKey | undefined;
    limit: number;
    userId: string;
  }) => RoomReaction[];
  detachMember: (userId: string, status: UserStatusInMessage) => void;
  // A user's live messages in this room, oldest first, from the id after the cursor
  exportUserMessages: (input: { after?: number | undefined; limit: number; userId: string }) => RoomMessage[];
  // One page of the reactions a user is one of the reactors of in this room, in key order after the key named
  exportUserReactions: (input: {
    after?: RoomReactionKey | undefined;
    limit: number;
    userId: string;
  }) => RoomReaction[];
  // A room-list event the room's own write raised, sent to each member online in the room through that member's object
  notifyOnlineMembers: (event: UserEvent) => Promise<void>;
  pinMessage: (id: number, actor: RoomActor) => null | RoomMessage;
  // The live messages after a page cursor in the room's message order, at most `limit` of them. A backward cursor reads the
  // Messages newer than its row, oldest first, which the caller turns back into the list's order
  readMessages: (input: { cursor: PageCursor; isPinned?: boolean | undefined; limit: number }) => RoomMessage[];
  readMessagesByIds: (ids: number[]) => RoomMessage[];
  readReactions: (messageIds: number[]) => RoomReaction[];
  // The scheduled messages of one person that are named, by their ids
  readScheduledMessages: (input: { ids: string[]; userId: string }) => ScheduledRoomMessage[];
  // The thread's root, when it is still live, followed by its live replies oldest first
  readThread: (threadRootId: number) => RoomMessage[];
  removeMember: (userId: string) => void;
  // Takes the actor off the emoji's reactors, deleting the reaction when the actor was its only one. False when the actor
  // Was not a reactor
  removeReaction: (input: { emojiTag: string; messageId: number }, actor: RoomActor) => boolean;
  // The matches after a page cursor, in the order getRoomSearchPageSort gives the query
  searchMessages: (input: RoomSearchInput) => RoomSearchResult;
  // A status the person set, which every room they are in shows
  setMemberStatus: (status: UserStatusInMessage) => void;
  unpinMessage: (id: number, actor: RoomActor) => null | RoomMessage;
  // The members the new text names are read from it by the object, as a send reads them
  updateMessage: (input: { id: number; message: string }, actor: RoomActor) => null | RoomMessage;
  updateScheduledMessage: (
    input: { id: string; message: string; replyToId?: number | undefined; runAt: Date },
    actor: RoomActor,
  ) => Promise<null | ScheduledRoomMessage>;
  // An option id votes, and no option id withdraws the actor's vote
  votePoll: (input: { id: number; optionId?: string | undefined }, actor: RoomActor) => null | RoomMessage;
}

// A reaction's key in its room: the message it is on and its emoji. Reactions are paged by this key, in its order
export interface RoomReactionKey {
  emojiTag: string;
  messageId: number;
}

// A match with the rank its room gave it when the search had text, which is the key a search with text is paged by
export type RoomSearchHit = RoomMessage & { rank: null | number };

export interface RoomSearchInput {
  cursor: PageCursor;
  filters: Filter[];
  // Only a search's first page asks for the count, so the matches are counted once per search
  isCounted: boolean;
  limit: number;
  query: string;
}

export interface RoomSearchResult {
  // Zero unless the input asked for it
  count: number;
  messages: RoomSearchHit[];
}

export type ScheduledRoomMessage = typeof scheduledMessagesInRoom.$inferSelect;
