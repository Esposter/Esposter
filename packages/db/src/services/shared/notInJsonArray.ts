import type { SQLWrapper } from "drizzle-orm";

import { JsonArrayParam } from "#src/models/shared/JsonArrayParam";
import { sql } from "drizzle-orm";

// The negation of `inJsonArray`, for the same reason: the list is one bound JSON array, so it is not capped by D1's
// Parameter limit. An empty list excludes nothing
export const notInJsonArray = (column: SQLWrapper, values: readonly string[]) =>
  sql`${column} not in (select value from json_each(${new JsonArrayParam(values)}))`;
