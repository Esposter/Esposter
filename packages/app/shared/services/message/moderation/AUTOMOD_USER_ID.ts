// Reserved user id used as the actor for automatic moderation actions (word-filter Warn/Timeout).
// It is a fixed v4-shaped UUID so it satisfies user-id validation, never collides with a real user,
// And lets the audit log render "AutoMod" instead of resolving a member display name.
export const AUTOMOD_USER_ID = "00000000-0000-4000-8000-000000000000";
