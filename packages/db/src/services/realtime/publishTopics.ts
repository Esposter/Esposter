import type { Topic, TopicObjectRpc } from "@esposter/db-schema";

// The calling Worker's binding of the realtime Worker's Topic objects, as much of it as a publish reads. Structural,
// Since each Worker types its bindings from its own copy of the Workers types
interface TopicNamespace<TId> {
  get: (id: TId) => Pick<TopicObjectRpc, "publish">;
  idFromName: (name: string) => TId;
}

// Each changed topic's object hears of the write once, however many times the write named it
export const publishTopics = async <TId>(topicNamespace: TopicNamespace<TId>, topics: Topic[]): Promise<void> => {
  await Promise.all(
    Array.from(new Set(topics), (topic) => topicNamespace.get(topicNamespace.idFromName(topic)).publish()),
  );
};
