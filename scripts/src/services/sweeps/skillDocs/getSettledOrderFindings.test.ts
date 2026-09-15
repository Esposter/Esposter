import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getSettledOrderFindings } from "#src/services/sweeps/skillDocs/getSettledOrderFindings";
import { describe, expect, test } from "vitest";

describe(getSettledOrderFindings, () => {
  const path = ".agents/skills/a/SKILL.md";
  const settled = "## Settled — do not re-propose";

  test("reports a settled list that is not the first section", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: `# A\n\n## B\n\nb\n\n${settled}\n\n- a\n` }])).toStrictEqual([
      { detail: `its ${settled} list is not the first section`, path, type: SkillDocsFindingType.SettledOrder },
    ]);
  });

  test("reports nothing for a settled list that is the first section", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: `# A\n\n${settled}\n\n- a\n\n## B\n` }])).toStrictEqual([]);
  });

  test("reports nothing for a skill with no settled list", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: "# A\n\n## B\n\nb\n" }])).toStrictEqual([]);
  });

  // A heading that only mentions the word is not the list — the shape is the exact string
  test("reports nothing for a heading that merely names settled decisions", () => {
    expect.hasAssertions();

    expect(
      getSettledOrderFindings([{ path, text: `# A\n\n## B\n\nb\n\n## Settled decisions\n\n- a\n` }]),
    ).toStrictEqual([]);
  });
});
