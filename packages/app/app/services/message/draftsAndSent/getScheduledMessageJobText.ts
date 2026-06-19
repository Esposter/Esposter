import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { ScheduledMessageJobType } from "@esposter/db-schema";

export const getScheduledMessageJobText = ({ payload }: ScheduledMessageJobInMessageWithRoom) =>
  payload.type === ScheduledMessageJobType.Reminder ? payload.text : payload.message;
