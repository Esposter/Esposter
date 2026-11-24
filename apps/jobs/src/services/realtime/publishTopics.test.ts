import type { TopicNamespace } from "@esposter/db";
import type { ColumnTopic, Database, Topic } from "@esposter/db-schema";

import { computeReadTopics, getWokenTopics, recordStatements } from "@esposter/db";
import { getColumnTopic, topicSchema } from "@esposter/db-schema";
import { describe } from "vitest";

// Every topic a job published, with the columns each publish named, in publish order. Stands in for the Topic objects,
// Which only exist inside the Workers runtime, so a test reads what a job told its readers
export const MockPublishedTopics: ColumnTopic[] = [];

// The names of the topics published, for a test that asks only which topics a write reached
export const getMockPublishedTopics = (): Topic[] => MockPublishedTopics.map(({ topic }) => topic);

// The topics a reader watches that the publishes made so far wake. The reader's statements run through the recorder
// Over the given database, so the topics its queries read are named the way the web names them for the same query, and
// The wake rule is the one the Topic objects apply
export const getReaderWakes = async (
  database: Database,
  read: (recorded: Database) => Promise<unknown>,
): Promise<Topic[]> => {
  const recorded = recordStatements(database);
  await read(recorded.database);
  return getWokenTopics(await computeReadTopics(recorded.statements), MockPublishedTopics);
};

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
