import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { QUEUE_PUSH_ACTION } from "#src/services/resume/constants";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";

// Commits ahead of the remote queue are owed a push. Commits behind it were landed from another checkout, which a pull brings in
export const getQueueItems = (ahead: number, behind: number): ResumeItem[] => [
  ...(ahead > 0 ? [{ action: QUEUE_PUSH_ACTION, text: `${ahead} ahead of ${REMOTE_QUEUE_REF}` }] : []),
  ...(behind > 0 ? [{ action: "", text: `${behind} behind ${REMOTE_QUEUE_REF}` }] : []),
];
