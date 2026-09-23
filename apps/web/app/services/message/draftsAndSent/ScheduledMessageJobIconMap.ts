// @unocss-include
import { ScheduledMessageJobType } from "@esposter/db-schema";

export const ScheduledMessageJobIconMap = {
  [ScheduledMessageJobType.Reminder]: "i-mdi:bell-outline",
  [ScheduledMessageJobType.ScheduledMessage]: "i-mdi:send-clock",
} as const satisfies Record<ScheduledMessageJobType, string>;
