import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { ScheduledMessageJobType } from "@esposter/db-schema";

export const getScheduledMessageJobText = ({ payload }: ScheduledMessageJobWithRoom) =>
  payload.type === ScheduledMessageJobType.Reminder ? payload.text : payload.message;
