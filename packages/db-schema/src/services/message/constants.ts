import type { PageSort } from "#src/models/pagination/PageSort";

import { SortOrder } from "#src/models/pagination/SortOrder";
import { ZERO_UUID } from "@esposter/shared";

// Reserved user id used as the actor for automatic moderation actions (word-filter Warn/Timeout).
// It is the all-zero v7 UUID, which passes user-id validation as a v7 and is given to no real user, since a user's id is
// Minted at random, and it lets the audit log render "AutoMod" instead of resolving a member display name.
export const AUTOMOD_USER_ID = ZERO_UUID;
// Caps the follow list read so resolving thread roots reads at most this many messages for a single request.
export const MAX_FOLLOWED_THREADS = 50;
export const MESSAGE_MAX_LENGTH = 10000;
export const MODERATION_NOTE_MAX_LENGTH = 2000;
// The largest 32-bit signed integer, the longest slowmode the field can be set to. It is not a whole number of
// Seconds, so a field editing it in seconds truncates what it advertises.
export const MAX_SLOWMODE_MS = 2_147_483_647;
// Matches the longest client-selectable timeout, which fits well inside a 32-bit signed integer.
export const MAX_TIMEOUT_DURATION_MS = Temporal.Duration.from({ days: 7 }).total("milliseconds");
export const PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH = 100;

// A room event that carries messages carries one send's worth: a message, or a forward and the note sent with it
export const MESSAGE_BATCH_MAX_LENGTH = 2;
// A bigint on the wire is its decimal digits, and a permission bitfield fits in a 64-bit integer, which has 20 of them
export const MEMBER_PERMISSION_BIGINT_REGEX = /^\d{1,20}$/u;
// A RealtimeKit participant token is a signed JWT, which the call's own join hands its client once
export const CALL_AUTH_TOKEN_MAX_LENGTH = 4096;
// The order a room's message list reads in, newest first by the room's own sequence id, which is unique within the room
export const ROOM_MESSAGE_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
// A room's search with text, in the order its rank puts its matches: each room's rank turn about, then the room, then the
// Message id. The rank is the position a room's own bm25 order gives the match, since scores are not comparable across rooms
export const ROOM_SEARCH_RANK_PAGE_SORT = {
  keys: ["rank", "roomId", "id"],
  order: SortOrder.Asc,
} as const satisfies PageSort<"id" | "rank" | "roomId">;
// A room's search without text, newest first by the message's time, then the room, then the message id
export const ROOM_SEARCH_NEWEST_PAGE_SORT = {
  keys: ["createdAt", "roomId", "id"],
  order: SortOrder.Desc,
} as const satisfies PageSort<"createdAt" | "id" | "roomId">;
// The messages a person sent, newest first. Their index holds each one once, under its room and its message id
export const SENT_MESSAGE_PAGE_SORT = {
  keys: ["createdAt", "roomId", "messageId"],
  order: SortOrder.Desc,
} as const satisfies PageSort<"createdAt" | "messageId" | "roomId">;
// The Scheduled tab: a person's reminders and scheduled messages, soonest first, then by the item's id
export const SCHEDULED_MESSAGE_JOB_PAGE_SORT = {
  keys: ["runAt", "id"],
  order: SortOrder.Asc,
} as const satisfies PageSort<"id" | "runAt">;
// A room's bans, newest first by when the ban was made, then by the banned user, which with the room is the ban's key
export const BAN_PAGE_SORT = { keys: ["createdAt", "userId"], order: SortOrder.Desc } as const satisfies PageSort<
  "createdAt" | "userId"
>;
// A room's moderation log, newest first by its id
export const MODERATION_LOG_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
// A member's moderation notes in a room, newest first by their id
export const MODERATION_NOTE_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
