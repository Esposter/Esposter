import type { TopicNamespace } from "@esposter/db";

import { describe } from "vitest";

// Every topic a job published, in publish order. Stands in for the Topic objects, which only exist inside the Workers
// Runtime, so a test reads what a job told its readers
export const MockPublishedTopics: string[] = [];

// The Topic objects' binding. Each object's publish records the topic it was named for, so a publish reaches the same
// Path it does in a Worker, deduplication included
export const mockTopicNamespace: TopicNamespace<string> = {
  get: (id) => ({
    publish: () => {
      MockPublishedTopics.push(id);
      return Promise.resolve();
    },
  }),
  idFromName: (name) => name,
};

describe.todo("publishTopics");
