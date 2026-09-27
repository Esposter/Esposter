import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getSettledOrderFindings } from "#src/services/sweeps/skillDocs/getSettledOrderFindings";
import { describe, expect, test } from "vitest";

describe(getSettledOrderFindings, () => {
  const path = ".agents/skills/a/SKILL.md";
  const pagePath = ".agents/skills/a/references/a.md";
  const settled = "## Settled — do not re-propose";

  test("reports a settled list that is not the first section", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: `# A\n\n## B\n\nb\n\n${settled}\n\n- a\n` }], [])).toStrictEqual([
      { detail: `its ${settled} list is not the first section`, path, type: SkillDocsFindingType.SettledOrder },
    ]);
  });

  test("reports nothing for a settled list that is the first section", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: `# A\n\n${settled}\n\n- a\n\n## B\n` }], [])).toStrictEqual([]);
  });

  test("reports nothing for a skill with no settled list", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: "# A\n\n## B\n\nb\n" }], [])).toStrictEqual([]);
  });

  test("reports a settled list under a reworded heading", () => {
    expect.hasAssertions();

    expect(getSettledOrderFindings([{ path, text: "# A\n\n## Settled — not doing\n\n- a\n" }], [])).toStrictEqual([
      { detail: `a settled list is headed other than ${settled}`, path, type: SkillDocsFindingType.SettledOrder },
    ]);
  });

  test("reports a settled list on a reference page", () => {
    expect.hasAssertions();

    expect(
      getSettledOrderFindings([], [{ path: pagePath, text: `# A\n\nRead when a.\n\n${settled}\n\n- a\n` }]),
    ).toStrictEqual([
      {
        detail: "a settled list sits on a reference page rather than first in its SKILL.md",
        path: pagePath,
        type: SkillDocsFindingType.SettledOrder,
      },
    ]);
  });

  test("reports nothing for a page heading that merely names the word", () => {
    expect.hasAssertions();

    expect(
      getSettledOrderFindings([], [{ path: pagePath, text: "# A\n\nRead when a.\n\n## A settled list\n" }]),
    ).toStrictEqual([]);
  });

  test("reports nothing for a settled heading inside a fenced example", () => {
    expect.hasAssertions();

    expect(
      getSettledOrderFindings([], [{ path: pagePath, text: `# A\n\nRead when a.\n\n\`\`\`md\n${settled}\n\`\`\`\n` }]),
    ).toStrictEqual([]);
  });
});
