import type { TopicNamespace } from "#src/models/realtime/TopicNamespace";
import type { ColumnTopic } from "@esposter/db-schema";

import { publishTopics } from "#src/services/realtime/publishTopics";
import { getResultAsync, noop } from "@esposter/shared";

// A publish behind a write that has already landed is best-effort: a failed one costs readers a refresh, never the write,
// So the failure is logged under the caller's message and not thrown. The topics are read inside that boundary too, so a
// Throw from reading them, or a write set read from the statements a request awaited, is logged the same way
export const publishTopicsBestEffort = <TId>(
  topicNamespace: TopicNamespace<TId>,
  readTopics: () => ColumnTopic[] | Promise<ColumnTopic[]>,
  failure: string,
): Promise<void> =>
  getResultAsync(async () => publishTopics(topicNamespace, await readTopics())).match(noop, (error) => {
    console.error(failure, error);
  });
