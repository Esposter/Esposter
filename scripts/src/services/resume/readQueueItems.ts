import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getQueueItems } from "#src/services/resume/getQueueItems";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { QUEUE_BRANCH, REMOTE_QUEUE_REF } from "#src/services/shared/constants";

export const readQueueItems = async (): Promise<ResumeItem[]> => {
  await runToolAsync("git", ["fetch", "--quiet", "origin", QUEUE_BRANCH]);
  const counts = await runToolAsync("git", ["rev-list", "--left-right", "--count", `${REMOTE_QUEUE_REF}...HEAD`]);
  const [behind = 0, ahead = 0] = counts.trim().split(/\s+/u).map(Number);
  return getQueueItems(ahead, behind);
};
