import type { Topic } from "@esposter/db-schema";

// The topics a read's answer named, and the server time its read began, taken before the read ran.
// A publish that lands after that time reaches a watch of the topics, even when the answer does not hold it
export interface TopicRead {
  readAt: number;
  topics: Topic[];
}
