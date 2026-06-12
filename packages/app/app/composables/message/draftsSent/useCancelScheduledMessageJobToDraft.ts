import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsSent/getScheduledMessageJobText";
import { useInputStore } from "@/store/message/input";

export const useCancelScheduledMessageJobToDraft = () => {
  const inputStore = useInputStore();
  const { storeDraft } = inputStore;
  const cancelScheduledMessageJob = useCancelScheduledMessageJob();
  return async (scheduledMessageJob: ScheduledMessageJobInMessageWithRoom) => {
    await cancelScheduledMessageJob(scheduledMessageJob.id);
    storeDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
  };
};
