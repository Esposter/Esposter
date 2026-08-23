import type { Clause } from "@esposter/azure";

import { isNullClause } from "@/services/filter/isNullClause";
import { BinaryOperator } from "@esposter/azure";
import { getTableNullClause } from "@esposter/db";
import { describe, expect, test } from "vitest";

describe(isNullClause, () => {
  const key = "";

  test("matches the canonical table null clause", () => {
    expect.hasAssertions();

    expect(isNullClause(getTableNullClause(key))).toBe(true);
  });

  // IsNullClause compares its argument against getTableNullClause(clause.key), so the positive case holds by
  // Construction; only a same-key clause that is NOT the null clause proves the predicate discriminates at all
  // Rather than always returning true.
  test("rejects a clause on the same key that is not the null clause", () => {
    expect.hasAssertions();

    const clause: Clause<Record<string, unknown>> = { key, operator: BinaryOperator.eq, value: "" };

    expect(isNullClause(clause)).toBe(false);
  });
});
