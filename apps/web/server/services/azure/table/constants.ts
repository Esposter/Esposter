// Bounded so a hot entity's concurrent writes cannot spin the mutation; on exhaustion the write is refused rather
// Than dropped, so the caller is told to try again instead of believing a lost change landed
export const MAX_ENTITY_ETAG_RETRIES = 3;
