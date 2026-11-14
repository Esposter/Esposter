import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useInputStore } from "@/store/message/input";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJobToDraft = () => {
  const inputStore = useInputStore();
  const { setDraft } = inputStore;
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { cancelScheduledMessageJob } = scheduledMessageJobStore;
  return async (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
    const isCancelled = await cancelScheduledMessageJob(scheduledMessageJob);
    // A rejected cancel leaves the job scheduled, so a draft written now would let a send post a second copy
    if (isCancelled) setDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
    return isCancelled;
  };
};
