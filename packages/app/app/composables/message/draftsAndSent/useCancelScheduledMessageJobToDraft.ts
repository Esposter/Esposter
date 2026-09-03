import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useInputStore } from "@/store/message/input";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJobToDraft = () => {
  const inputStore = useInputStore();
  const { setDraft } = inputStore;
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { cancelScheduledMessageJob } = scheduledMessageJobStore;
  return async (scheduledMessageJob: ScheduledMessageJobInMessageWithRoom) => {
    await cancelScheduledMessageJob(scheduledMessageJob.id);
    setDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
  };
};
