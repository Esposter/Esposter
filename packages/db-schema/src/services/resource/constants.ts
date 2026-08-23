import { dayjs } from "#src/services/dayjs/index";

export const RECYCLE_BIN_RETENTION_DAYS = 30;
// A soft-deleted resource is destroyed for good this long after it lands in the Recycle bin.
// Lives here — browser-safe db-schema — so both the app UI (the "purges in {n}d" column, the delete
// Dialogs) and the purge timer agree on the window: one value, one source.
export const RECYCLE_BIN_RETENTION_MS = dayjs.duration(RECYCLE_BIN_RETENTION_DAYS, "days").asMilliseconds();
