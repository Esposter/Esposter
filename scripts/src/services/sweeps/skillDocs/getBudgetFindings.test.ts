import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { MAX_SKILL_BYTES } from "#src/services/sweeps/skillDocs/constants";
import { getBudgetFindings } from "#src/services/sweeps/skillDocs/getBudgetFindings";
import { describe, expect, test } from "vitest";

describe(getBudgetFindings, () => {
  const path = ".agents/skills/a/SKILL.md";

  // An em-dash is three bytes, so a page of them reports where a code-point count says it fits
  test("counts bytes rather than code points", () => {
    expect.hasAssertions();

    const text = "—".repeat(MAX_SKILL_BYTES / 2);

    expect(getBudgetFindings([{ path, text }])).toStrictEqual([
      { detail: `${(MAX_SKILL_BYTES / 2) * 3} bytes`, path, type: SkillDocsFindingType.Budget },
    ]);
  });

  test("reports nothing for a page inside the budget", () => {
    expect.hasAssertions();

    expect(getBudgetFindings([{ path, text: "a" }])).toStrictEqual([]);
  });
});
