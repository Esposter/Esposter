import { z } from "zod";

// Values are Vuetify's own type/color tokens, so a severity is handed straight to `v-icon` and `v-alert`
// Without a translation table between the stored value and the rendered one.
export enum NotificationSeverity {
  Error = "error",
  Info = "info",
  Success = "success",
  Warning = "warning",
}

export const notificationSeveritySchema = z.enum(NotificationSeverity) satisfies z.ZodType<NotificationSeverity>;
