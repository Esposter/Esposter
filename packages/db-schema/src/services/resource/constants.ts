export const MAX_TAG_NAME_LENGTH = 128;
export const MAX_TAG_VALUE_LENGTH = 256;
export const MAX_TAGS_COUNT = 50;
export const RECYCLE_BIN_RETENTION_DAYS = 30;
export const RESOURCE_NAME_MAX_LENGTH = 100;
// A soft-deleted resource is destroyed for good this long after it lands in the Recycle bin.
// Lives here — browser-safe db-schema — so both the app UI (the "purges in {n}d" column, the delete
// Dialogs) and the purge timer agree on the window: one value, one source.
export const RECYCLE_BIN_RETENTION_MS = Temporal.Duration.from({ days: RECYCLE_BIN_RETENTION_DAYS }).total(
  "milliseconds",
);
