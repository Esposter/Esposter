import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { MAX_SKILL_BYTES, MAX_SKILL_LINES } from "#src/services/sweeps/skillDocs/constants";
import { getBudgetFindings } from "#src/services/sweeps/skillDocs/getBudgetFindings";
import { describe, expect, test } from "vitest";

describe(getBudgetFindings, () => {
  const path = ".agents/skills/a/SKILL.md";

  test("reports a page past the line budget", () => {
    expect.hasAssertions();

    expect(getBudgetFindings([{ path, text: "a\n".repeat(MAX_SKILL_LINES) }])).toStrictEqual([
      {
        detail: `${MAX_SKILL_LINES * 2} bytes, ${MAX_SKILL_LINES + 1} lines`,
        path,
        type: SkillDocsFindingType.Budget,
      },
    ]);
  });

  // An em-dash is three bytes, so a page of them reports where a code-point count says it fits
  test("counts bytes rather than code points", () => {
    expect.hasAssertions();

    const text = "—".repeat(MAX_SKILL_BYTES / 2);

    expect(getBudgetFindings([{ path, text }])).toStrictEqual([
      { detail: `${(MAX_SKILL_BYTES / 2) * 3} bytes, 1 lines`, path, type: SkillDocsFindingType.Budget },
    ]);
  });

  test("reports nothing for a page inside both budgets", () => {
    expect.hasAssertions();

    expect(getBudgetFindings([{ path, text: "a" }])).toStrictEqual([]);
  });
});
