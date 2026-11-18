import type { Topic } from "@esposter/db-schema";

import { publishTopics } from "#src/services/realtime/publishTopics";
import { getResultAsync, noop } from "@esposter/shared";

// A publish behind a write that has already landed is best-effort: a failed one costs readers a refresh, never the write,
// So the failure is logged under the caller's message and not thrown
export const publishTopicsBestEffort = (topics: Topic[], failure: string): Promise<void> =>
  getResultAsync(() => publishTopics(topics)).match(noop, (error) => {
    console.error(failure, error);
  });
