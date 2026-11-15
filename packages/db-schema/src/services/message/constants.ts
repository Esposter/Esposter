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
