import { isNullClause } from "@/services/filter/isNullClause";
import { getTableNullClause } from "@esposter/db";
import { describe, expect, test } from "vitest";

describe(isNullClause, () => {
  test(getTableNullClause, () => {
    expect.hasAssertions();

    const clause = getTableNullClause("");

    expect(isNullClause(clause)).toBe(true);
  });
});
