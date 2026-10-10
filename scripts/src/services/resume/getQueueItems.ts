import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { QUEUE_PUSH_ACTION, QUEUE_REMOTE_REF } from "#src/services/resume/constants";

// Commits ahead of the remote queue are owed a push. Commits behind it are the collector's rewrite, which the push replays
export const getQueueItems = (ahead: number, behind: number): ResumeItem[] => [
  ...(ahead > 0 ? [{ action: QUEUE_PUSH_ACTION, text: `${ahead} ahead of ${QUEUE_REMOTE_REF}` }] : []),
  ...(behind > 0 ? [{ action: "", text: `${behind} behind ${QUEUE_REMOTE_REF}` }] : []),
];
