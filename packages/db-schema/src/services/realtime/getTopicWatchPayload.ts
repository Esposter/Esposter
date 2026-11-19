import type { ColumnTopic } from "#src/models/realtime/Topic";

// The text a watch's signature is made over: the person the read was made for, the time it began, and each topic with the
// Columns it names. A topic that names every column is `[topic]` and one that names a list is `[topic, columns]`, so a topic
// With no columns and one with an empty list are told apart. The web Worker signs this text and the realtime object checks
// It, so both build it from here
export const getTopicWatchPayload = (userId: string, readAt: number, topics: ColumnTopic[]): string =>
  JSON.stringify([
    userId,
    readAt,
    topics.map(({ columns, topic }) => (columns === undefined ? [topic] : [topic, columns])),
  ]);
