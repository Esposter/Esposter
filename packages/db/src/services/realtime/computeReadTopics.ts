import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ColumnTopic } from "@esposter/db-schema";

import { computeStatementReadTopics } from "#src/services/realtime/computeStatementReadTopics";
import { mergeColumnTopics } from "@esposter/db-schema";

// The topics a read watches, from the statements it awaited, each once and in a fixed order, with the columns it reads of each
export const computeReadTopics = async (statements: RecordedStatement[]): Promise<ColumnTopic[]> => {
  const topicLists = await Promise.all(
    statements.map((recordedStatement) => computeStatementReadTopics(recordedStatement)),
  );
  return mergeColumnTopics(topicLists.flat());
};
