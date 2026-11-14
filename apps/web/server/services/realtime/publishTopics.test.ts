import type { Topic } from "@esposter/db-schema";

import { describe } from "vitest";

// Every topic a mutation published, in publish order. Stands in for the Topic objects, which only exist inside the
// Workers runtime, so a test reads what a write told its readers
export const MockPublishedTopics: Topic[] = [];

export const publishTopics = (topics: Topic[]): Promise<void> => {
  MockPublishedTopics.push(...topics);
  return Promise.resolve();
};

describe.todo("publishTopics");
