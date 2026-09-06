import { getBudgetFindings, MAX_SKILL_BYTES, MAX_SKILL_LINES } from "#scripts/sweeps/skillDocs/getBudgetFindings";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";
import { describe, expect, test } from "vitest";

describe(getBudgetFindings, () => {
  const path = ".agents/skills/a/SKILL.md";

  test("reports a page past the line budget", () => {
    expect.hasAssertions();

    expect(getBudgetFindings([{ path, text: "a\n".repeat(MAX_SKILL_LINES) }])).toStrictEqual([
      {
        detail: `${(MAX_SKILL_LINES * 2).toString()} bytes, ${(MAX_SKILL_LINES + 1).toString()} lines`,
        path,
        type: SkillDocsFindingType.Budget,
      },
    ]);
  });

  // An em-dash is three bytes, so a page of them reports where a code-point count says it fits
  test("counts bytes rather than code points", () => {
    expect.hasAssertions();

    const text = "—".repeat(MAX_SKILL_BYTES / 2);

    expect(getBudgetFindings([{ path, text }])).toHaveLength(1);
  });

  test("reports nothing for a page inside both budgets", () => {
    expect.hasAssertions();

    expect(getBudgetFindings([{ path, text: "a" }])).toStrictEqual([]);
  });
});
