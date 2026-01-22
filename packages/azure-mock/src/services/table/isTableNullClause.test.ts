import { isTableNullClause } from "@/services/table/isTableNullClause";
import { getTableNullClause } from "@esposter/db";
import { describe, expect, test } from "vitest";

describe(isTableNullClause, () => {
  test(getTableNullClause, () => {
    expect.hasAssertions();

    const clause = getTableNullClause("");

    expect(isTableNullClause(clause)).toBe(true);
  });
});
