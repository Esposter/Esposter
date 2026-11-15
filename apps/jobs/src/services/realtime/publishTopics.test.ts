import type { Topic } from "@esposter/db-schema";

import { describe } from "vitest";

// Every topic a job published, in publish order. Stands in for the Topic objects, which only exist inside the Workers
// Runtime, so a test reads what a job told its readers
export const MockPublishedTopics: Topic[] = [];

export const publishTopics = (topics: Topic[]): Promise<void> => {
  MockPublishedTopics.push(...topics);
  return Promise.resolve();
};

describe.todo("publishTopics");
