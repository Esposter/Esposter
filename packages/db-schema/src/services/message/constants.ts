import { dayjs } from "@/services/dayjs";

// Caps the follow list read so resolving thread roots never fans out an unbounded number of
// Azure Table point reads for a single request.
export const MAX_FOLLOWED_THREADS = 50;
// Matches the longest client-selectable timeout and keeps stored durations within Postgres integer range.
export const MAX_TIMEOUT_DURATION_MS = dayjs.duration(7, "days").asMilliseconds();
export const PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH = 100;
