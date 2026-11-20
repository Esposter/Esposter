import type { ColumnTopic } from "#src/models/realtime/Topic";

// The topics a read's answer named, with the columns it read of each, and the server time its read began, taken before the
// Read ran. A publish that lands after that time reaches a watch of the topics, even when the answer does not hold it. The
// Signature is the server's over those topics for the person who read them, which the realtime object checks before it
// Takes a watch of them (`createTopicWatchSignature`). It is empty when the read has no signature to make
export interface TopicRead {
  readAt: number;
  signature: string;
  topics: ColumnTopic[];
}
