import type { Clause } from "@esposter/azure";

import { checkIsNullClause } from "#src/services/filter/checkIsNullClause";
import { BinaryOperator, getTableNullClause } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(checkIsNullClause, () => {
  const key = "";

  test("matches the canonical table null clause", () => {
    expect.hasAssertions();

    expect(checkIsNullClause(getTableNullClause(key))).toBe(true);
  });

  // The predicate compares its argument against getTableNullClause(clause.key), so the positive case holds
  // By construction; only a same-key clause that is NOT the null clause proves it discriminates at all
  // Rather than always returning true.
  test("rejects a clause on the same key that is not the null clause", () => {
    expect.hasAssertions();

    const clause: Clause<Record<string, unknown>> = { key, operator: BinaryOperator.eq, value: "" };

    expect(checkIsNullClause(clause)).toBe(false);
  });
});
