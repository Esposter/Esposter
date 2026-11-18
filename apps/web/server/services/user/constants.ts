// How long the read link to a ready export holds. The archive is the whole account, so the link is short-lived and
// Only ever minted to its owner, who asks again for a new one rather than keeping a copy
export const DATA_EXPORT_LINK_DURATION_MS = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");
// The topics a profile save publishes at once. A person in many rooms, or with many requests and posts, is one publish per
// Topic, never one open call each
export const MAX_CONCURRENT_PROFILE_TOPIC_PUBLISHES = 50;
