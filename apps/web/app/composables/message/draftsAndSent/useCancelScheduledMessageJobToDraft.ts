import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { useInputStore } from "#src/store/message/input/index";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJobToDraft = () => {
  const inputStore = useInputStore();
  const { setDraft } = inputStore;
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { cancelScheduledMessageJob } = scheduledMessageJobStore;
  // The composer takes the job's text once the cancel is answered, so a refused cancel leaves the composer as it was
  // And nothing has to be given back
  return (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
    cancelScheduledMessageJob(scheduledMessageJob, () => {
      setDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
    });
  };
};
