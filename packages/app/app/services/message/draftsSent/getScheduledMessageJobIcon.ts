import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { ScheduledMessageJobType } from "@esposter/db-schema";

export const getScheduledMessageJobIcon = ({ payload }: ScheduledMessageJobInMessageWithRoom) =>
  payload.type === ScheduledMessageJobType.Reminder ? "mdi-bell-outline" : "mdi-send-clock";
