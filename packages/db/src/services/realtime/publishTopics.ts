import type { TopicNamespace } from "#src/models/realtime/TopicNamespace";
import type { ColumnTopic } from "@esposter/db-schema";

import { mergeColumnTopics } from "@esposter/db-schema";

// Each changed topic's object hears of the write once, however many times the write named it, with the columns the write
// Changed on it. A row-set change publishes no columns, so every watch of the topic hears of it
export const publishTopics = async <TId>(topicNamespace: TopicNamespace<TId>, topics: ColumnTopic[]): Promise<void> => {
  await Promise.all(
    mergeColumnTopics(topics).map(({ columns, topic }) =>
      topicNamespace.get(topicNamespace.idFromName(topic)).publish(columns),
    ),
  );
};
