import { dayjs } from "@/services/dayjs";

// A soft-deleted resource is destroyed for good this long after it lands in the Recycle bin.
// Lives here because both the app (the "purges in {n}d" column) and the timer function that
// Actually purges must agree on the window — one source of truth for the one value.
export const RECYCLE_BIN_RETENTION_MS = dayjs.duration(30, "days").asMilliseconds();
