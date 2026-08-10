import { ScheduledMessageJobType } from "@esposter/db-schema";

export const ScheduledMessageJobIconMap = {
  [ScheduledMessageJobType.Reminder]: "mdi-bell-outline",
  [ScheduledMessageJobType.ScheduledMessage]: "mdi-send-clock",
} as const satisfies Record<ScheduledMessageJobType, string>;
