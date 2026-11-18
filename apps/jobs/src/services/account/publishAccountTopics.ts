import type { Topic } from "@esposter/db-schema";

import { MAX_CONCURRENT_ACCOUNT_TOPIC_PUBLISHES } from "#src/services/account/constants";
import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { settleAll } from "@esposter/shared";

// The topics of an account's sweep, one publish each and a chunk at a time, each best-effort as the topics of a write are:
// A failed publish costs a reader one refresh, never the sweep
export const publishAccountTopics = async (topics: Topic[]): Promise<void> => {
  await settleAll(
    Array.from(
      new Set(topics),
      (topic) => () =>
        publishTopicsBestEffort([topic], `Failed to publish the topic "${topic}" of an account's deletion:`),
    ),
    MAX_CONCURRENT_ACCOUNT_TOPIC_PUBLISHES,
  );
};
