import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { D1_MAX_BOUND_PARAMETERS } from "#src/services/shared/constants";
import { getColumns } from "drizzle-orm";

// The rows one insert into `table` holds under D1's bound-parameter cap. A row binds at most one value per column, so
// The count is read off the table rather than restated beside it, where a column added later would push it past the cap
export const getRowsPerStatement = (table: SQLiteTable) =>
  Math.floor(D1_MAX_BOUND_PARAMETERS / Object.keys(getColumns(table)).length);
