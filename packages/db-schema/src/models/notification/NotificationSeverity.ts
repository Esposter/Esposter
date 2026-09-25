import { z } from "zod";

// Values are the UI's status token names, so a severity is handed straight to a toast or an alert without a
// Translation table between the stored value and the rendered one
export enum NotificationSeverity {
  Error = "error",
  Info = "info",
  Success = "success",
  Warning = "warning",
}

export const notificationSeveritySchema = z.enum(NotificationSeverity) satisfies z.ZodType<NotificationSeverity>;
