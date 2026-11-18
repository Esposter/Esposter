import type { TopicNamespace } from "#src/models/realtime/TopicNamespace";
import type { Topic } from "@esposter/db-schema";

// Each changed topic's object hears of the write once, however many times the write named it
export const publishTopics = async <TId>(topicNamespace: TopicNamespace<TId>, topics: Topic[]): Promise<void> => {
  await Promise.all(
    Array.from(new Set(topics), (topic) => topicNamespace.get(topicNamespace.idFromName(topic)).publish()),
  );
};
