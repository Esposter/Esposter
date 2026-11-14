import type { SQLWrapper } from "drizzle-orm";

import { sql } from "drizzle-orm";

// `column in (values)` with the whole list bound as one JSON array rather than a parameter per value. D1 caps a statement
// At 100 bound parameters, so an IN list over a caller's list fails once the list passes that. `json_each` reads the array
// Back as rows, and the subquery probes the column's index the way an IN list does. An empty list matches nothing
export const inJsonArray = (column: SQLWrapper, values: readonly string[]) =>
  sql`${column} in (select value from json_each(${JSON.stringify(values)}))`;
