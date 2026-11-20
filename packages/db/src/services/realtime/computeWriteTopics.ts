import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ColumnTopic } from "@esposter/db-schema";

import { computeStatementWriteTopics } from "#src/services/realtime/computeStatementWriteTopics";
import { mergeStatementTopics } from "#src/services/realtime/mergeStatementTopics";

// The topics a request's writes publish, each once and in a fixed order, so the same writes name the same list whatever
// Order they ran in. A statement that is not a write publishes nothing
export const computeWriteTopics = (statements: RecordedStatement[]): Promise<ColumnTopic[]> =>
  mergeStatementTopics(statements, computeStatementWriteTopics);
