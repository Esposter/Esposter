import type { Topic } from "@esposter/db-schema";

import { publishTopics } from "#server/services/realtime/publishTopics";
import { getResultAsync, noop } from "@esposter/shared";

// A publish behind a write that has already landed is best-effort: a failed one costs readers a refresh, never the write,
// So the failure is logged under the caller's message and not thrown. The topics are read inside that boundary too, so a
// Throw from reading them is logged the same way
export const publishTopicsBestEffort = (getTopics: () => Topic[], failure: string): Promise<void> =>
  getResultAsync(() => publishTopics(getTopics())).match(noop, (error) => {
    console.error(failure, error);
  });
