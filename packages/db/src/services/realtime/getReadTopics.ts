import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeTopic } from "@esposter/db-schema";

import { getStatementReadTopics } from "#src/services/realtime/getStatementReadTopics";

// The topics a read watches, from the statements it awaited, each once and in a fixed order
export const getReadTopics = async (statements: RecordedStatement[]): Promise<ScopeTopic[]> => {
  const topicLists = await Promise.all(
    statements.map((recordedStatement) => getStatementReadTopics(recordedStatement)),
  );
  return [...new Set(topicLists.flat())].toSorted();
};
