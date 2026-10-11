import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

export const createDistinctCheckSql = (first: PgColumn, second: PgColumn) => sql`${first} != ${second}`;
