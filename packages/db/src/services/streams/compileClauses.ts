import type { StreamTableSchema } from "#src/models/streams/StreamTableSchema";
import type { Clause } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { BinaryOperator } from "@esposter/db-schema";
import { and, or } from "drizzle-orm";
import { compileClause } from "#src/services/streams/compileClause";

const RANGE_OPERATORS: BinaryOperator[] = [BinaryOperator.Ge, BinaryOperator.Gt, BinaryOperator.Le, BinaryOperator.Lt];

// Clauses on one key are or-grouped, unless one of them is a range, which and-joins the group, as a range is a bound
// on one side of a span. Groups on different keys are and-joined. No clauses is no condition at all
export const compileClauses = (clauses: Clause<Record<string, unknown>>[], table: StreamTableSchema): SQL | undefined =>
  and(
    ...Object.values(Object.groupBy(clauses, ({ key }) => key)).map((group) => {
      const conditions = (group ?? []).map((clause) => compileClause(clause, table));
      const isRangeGroup = (group ?? []).some(({ operator }) => RANGE_OPERATORS.includes(operator));
      return isRangeGroup ? and(...conditions) : or(...conditions);
    }),
  );
