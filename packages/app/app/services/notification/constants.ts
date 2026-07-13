import { dayjs } from "#shared/services/dayjs";

export const NOTIFICATION_SNACKBAR_TIMEOUT_MS = dayjs.duration(5, "seconds").asMilliseconds();
// Vuetify's "never auto-dismiss" sentinel — errors persist until dismissed
export const NOTIFICATION_SNACKBAR_PERSISTENT_TIMEOUT = -1;
