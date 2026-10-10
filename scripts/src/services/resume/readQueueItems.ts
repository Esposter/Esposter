import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { QUEUE_REMOTE_REF } from "#src/services/resume/constants";
import { getQueueItems } from "#src/services/resume/getQueueItems";
import { runToolAsync } from "#src/services/resume/runToolAsync";

export const readQueueItems = async (): Promise<ResumeItem[]> => {
  await runToolAsync("git", ["fetch", "--quiet", "origin", "ai/queue"]);
  const counts = await runToolAsync("git", ["rev-list", "--left-right", "--count", `${QUEUE_REMOTE_REF}...HEAD`]);
  const [behind = 0, ahead = 0] = counts.trim().split(/\s+/u).map(Number);
  return getQueueItems(ahead, behind);
};
