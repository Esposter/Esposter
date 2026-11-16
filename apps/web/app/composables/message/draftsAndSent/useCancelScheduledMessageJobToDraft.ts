import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { useInputStore } from "#src/store/message/input/index";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJobToDraft = () => {
  const inputStore = useInputStore();
  const { restoreDraft, setDraft } = inputStore;
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { cancelScheduledMessageJob } = scheduledMessageJobStore;
  return (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
    const { roomId } = scheduledMessageJob;
    // What the composer held before the job's text took its place, which a refused cancel puts back
    const previousDraft = inputStore.drafts.get(roomId);
    setDraft(roomId, getScheduledMessageJobText(scheduledMessageJob));
    const writtenContent = inputStore.drafts.get(roomId)?.content;
    // A rejected cancel leaves the job scheduled, so the composer gives its draft back, and only while it still holds the
    // Text written here. The composer's own save rewrites the draft as the same text, so the text is what is compared: a
    // Reader who has typed into it since keeps what they typed
    cancelScheduledMessageJob(scheduledMessageJob, () => {
      if (inputStore.drafts.get(roomId)?.content === writtenContent) restoreDraft(roomId, previousDraft);
    });
  };
};
