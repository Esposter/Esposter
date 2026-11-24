import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ColumnTopic } from "@esposter/db-schema";

import { mergeColumnTopics } from "@esposter/db-schema";

// The topics of several statements, each once and in a fixed order, from the function that names one
// Statement's topics. The statements' lists are merged whatever order they ran in, so the same statements name the same
// List
export const mergeStatementTopics = async (
  statements: RecordedStatement[],
  computeStatementTopics: (recordedStatement: RecordedStatement) => Promise<ColumnTopic[]>,
): Promise<ColumnTopic[]> => {
  const topicLists = await Promise.all(
    statements.map((recordedStatement) => computeStatementTopics(recordedStatement)),
  );
  return mergeColumnTopics(topicLists.flat());
};
