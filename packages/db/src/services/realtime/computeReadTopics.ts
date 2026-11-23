import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ColumnTopic } from "@esposter/db-schema";

import { computeStatementReadTopics } from "#src/services/realtime/computeStatementReadTopics";
import { mergeStatementTopics } from "#src/services/realtime/mergeStatementTopics";

// The topics a read watches, from the statements it awaited, each once and in a fixed order, with the columns it reads
// Of each
export const computeReadTopics = (statements: RecordedStatement[]): Promise<ColumnTopic[]> =>
  mergeStatementTopics(statements, computeStatementReadTopics);
