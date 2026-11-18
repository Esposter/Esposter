import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeTopic } from "@esposter/db-schema";

import { getStatementWriteTopics } from "#src/services/realtime/getStatementWriteTopics";

// The topics a request's writes publish, each once and in a fixed order, so the same writes name the same list whatever
// Order they ran in. A statement that is not a write publishes nothing
export const getWriteTopics = async (statements: RecordedStatement[]): Promise<ScopeTopic[]> => {
  const topicLists = await Promise.all(
    statements.map((recordedStatement) => getStatementWriteTopics(recordedStatement)),
  );
  return [...new Set(topicLists.flat())].toSorted();
};
