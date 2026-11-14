import type { Database } from "@esposter/db-schema";

import { surveyResponsesInResource } from "@esposter/db-schema";
import { chunk } from "@esposter/shared";

// Rows go in statements of ten, since a D1 statement binds at most a hundred parameters and each row binds nine. The
// Statements go in batches of a hundred, one request each, since a statement per request overruns a test's timeout
export const insertSurveyResponses = async (
  db: Database,
  rows: (typeof surveyResponsesInResource)["$inferInsert"][],
) => {
  const statements = chunk(rows, 10).map((batch) => db.insert(surveyResponsesInResource).values(batch));
  for (const group of chunk(statements, 100)) {
    const [firstStatement, ...restStatements] = group;
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a failed batch stops the groups behind it, and the groups before it stay committed
    if (firstStatement) await db.batch([firstStatement, ...restStatements]);
  }
};
