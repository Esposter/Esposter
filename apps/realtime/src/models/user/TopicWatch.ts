import type { Topic } from "@esposter/db-schema";

// A topic a tab watches, with the id of the tab's socket that watches it
export interface TopicWatch {
  topic: Topic;
  watchId: string;
}
