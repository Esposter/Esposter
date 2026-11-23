import type { TopicNamespace } from "#src/models/realtime/TopicNamespace";
import type { ColumnTopic } from "@esposter/db-schema";

import { mergeColumnTopics } from "@esposter/db-schema";

// Each changed topic's object hears of the write once, however many times the write named it, with the columns the
// Write Changed on it. A row-set change publishes no columns, so every watch of the topic hears of it
export const publishTopics = async <TId>(topicNamespace: TopicNamespace<TId>, topics: ColumnTopic[]): Promise<void> => {
  await Promise.all(
    mergeColumnTopics(topics).map(({ columns, topic }) =>
      // A topic is named to its Topic object, which
      // oxlint-disable-next-line selector-ban/no-restricted-syntax -- takes publishes; no object's invoke answers one
      topicNamespace.get(topicNamespace.idFromName(topic)).publish(columns),
    ),
  );
};
