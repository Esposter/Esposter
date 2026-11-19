import type { ColumnTopic } from "@esposter/db-schema";

// The topics a read's answer named, with the columns it read of each, and the server time its read began, taken before the
// Read ran. A publish that lands after that time reaches a watch of the topics, even when the answer does not hold it
export interface TopicRead {
  readAt: number;
  topics: ColumnTopic[];
}
