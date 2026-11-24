import type { TopicNamespace } from "@esposter/db";
import type { ColumnTopic, Topic } from "@esposter/db-schema";

import { getColumnTopic, topicSchema } from "@esposter/db-schema";
import { describe } from "vitest";

// Every topic a mutation published, with the columns each publish named, in publish order. Stands in for the Topic
// Objects, which only exist inside the Workers runtime, so a test reads what a write told its readers
export const MockPublishedTopics: ColumnTopic[] = [];

// The names of the topics published, for a test that asks only which topics a write reached
export const getMockPublishedTopics = (): Topic[] => MockPublishedTopics.map(({ topic }) => topic);

// The Topic objects' binding. Each object's publish records the topic it was named for and the columns it changed, so a
// Publish reaches the same path it does in a Worker, deduplication included
export const mockTopicNamespace: TopicNamespace<Topic> = {
  get: (id) => ({
    publish: (columns) => {
      MockPublishedTopics.push(getColumnTopic(id, columns));
      return Promise.resolve();
    },
  }),
  idFromName: (name) => topicSchema.parse(name),
};

describe.todo("publishTopics");
