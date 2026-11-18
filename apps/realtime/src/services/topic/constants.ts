// How long a topic gathers publishes before its subscribers hear of them, so a burst of writes costs each reader one
// Refetch rather than one per write
export const TOPIC_COALESCE_MS = 250;
// The storage key prefix of a topic's subscribers, one key per user watching it
export const TOPIC_SUBSCRIBER_KEY_PREFIX = "subscriber:";
// The storage key of the time a topic was last published, which a subscription's read time is checked against
export const TOPIC_PUBLISHED_AT_KEY = "publishedAt";
// How far before a read's time a publish may fall and still reach the read. The read is stamped by one Worker and the
// Publish by another, so a second of clock skew between them must not let a publish the read missed slip past
export const TOPIC_READ_SKEW_MS = 1000;
// The storage key prefix of a watch, one key per watch: the id of the tab that holds it and the topic it watches
export const WATCHED_TOPIC_KEY_PREFIX = "watchedTopic:";
