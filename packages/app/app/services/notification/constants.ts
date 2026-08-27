import { dayjs } from "#shared/services/dayjs";

export const NOTIFICATION_SNACKBAR_TIMEOUT_MS = dayjs.duration(5, "seconds").asMilliseconds();
