// Bounded so a hot resource's concurrent increments cannot spin the read path; on exhaustion the count drops
export const MAX_VIEW_COUNT_ETAG_RETRIES = 3;
