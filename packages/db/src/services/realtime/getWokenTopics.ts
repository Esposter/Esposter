import type { ColumnTopic, Topic } from "@esposter/db-schema";

import { checkWakes } from "@esposter/db-schema";

// The topics a read watches that a write reaches it through: a topic the write publishes whose columns the read watches
// The same way the Topic object checks them, so a test or a check reads the wake-ups the write makes
export const getWokenTopics = (readTopics: ColumnTopic[], writeTopics: ColumnTopic[]): Topic[] =>
  readTopics.flatMap(({ columns, topic }) =>
    writeTopics.some((write) => write.topic === topic && checkWakes(columns, write.columns)) ? [topic] : [],
  );
