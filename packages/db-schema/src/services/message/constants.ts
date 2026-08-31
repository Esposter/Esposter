// Reserved user id used as the actor for automatic moderation actions (word-filter Warn/Timeout).
// It is a fixed v4-shaped UUID so it satisfies user-id validation, never collides with a real user,
// And lets the audit log render "AutoMod" instead of resolving a member display name.
export const AUTOMOD_USER_ID = "00000000-0000-4000-8000-000000000000";
// Caps the follow list read so resolving thread roots never fans out an unbounded number of
// Azure Table point reads for a single request.
export const MAX_FOLLOWED_THREADS = 50;
// Matches the longest client-selectable timeout and keeps stored durations within Postgres integer range.
export const MAX_TIMEOUT_DURATION_MS = Temporal.Duration.from({ days: 7 }).total("milliseconds");
export const PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH = 100;
