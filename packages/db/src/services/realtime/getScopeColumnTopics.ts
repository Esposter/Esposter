import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ColumnTopic } from "@esposter/db-schema";

import { getScopeValueTopic } from "#src/services/realtime/getScopeTopics";
import { getColumnTopic } from "@esposter/db-schema";

// The topic each scope value names, with the columns the read references of that value's table
export const getScopeColumnTopics = (
  scopeValues: ScopeValue[],
  getColumns: (tableName: string) => string[] | undefined,
): Promise<ColumnTopic[]> =>
  Promise.all(
    scopeValues.map(async (scopeValue) =>
      getColumnTopic(await getScopeValueTopic(scopeValue), getColumns(scopeValue.table)),
    ),
  );
