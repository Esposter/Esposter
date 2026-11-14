// How long a topic gathers publishes before its subscribers hear of them, so a burst of writes costs each reader one
// Refetch rather than one per write
export const TOPIC_COALESCE_MS = 250;
// The storage key prefix of a topic's subscribers, one key per user watching it
export const TOPIC_SUBSCRIBER_KEY_PREFIX = "subscriber:";
