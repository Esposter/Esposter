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
    const isCancelled = await cancelScheduledMessageJob(scheduledMessageJob.id);
    // A rejected cancel leaves the job scheduled, so a draft written now would let a send post a second copy
    if (isCancelled) setDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
  };
};
