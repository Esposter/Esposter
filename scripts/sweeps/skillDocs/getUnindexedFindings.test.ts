import { getUnindexedFindings } from "#scripts/sweeps/skillDocs/getUnindexedFindings";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";
import { describe, expect, test } from "vitest";

describe(getUnindexedFindings, () => {
  const skillPath = ".agents/skills/a/SKILL.md";
  const pagePath = ".agents/skills/a/references/a.md";

  test("reports a page its own SKILL.md never names", () => {
    expect.hasAssertions();

    expect(getUnindexedFindings([{ path: skillPath, text: "" }], [{ path: pagePath, text: "" }])).toStrictEqual([
      { detail: "no SKILL.md line names it", path: pagePath, type: SkillDocsFindingType.Unindexed },
    ]);
  });

  test("reports nothing for a page its own SKILL.md indexes", () => {
    expect.hasAssertions();

    expect(
      getUnindexedFindings([{ path: skillPath, text: "`references/a.md` — a" }], [{ path: pagePath, text: "" }]),
    ).toStrictEqual([]);
  });

  // The index line has to be in the page's own skill; another skill naming the same filename is not coverage
  test("reports a page only another skill names", () => {
    expect.hasAssertions();

    expect(
      getUnindexedFindings(
        [
          { path: skillPath, text: "" },
          { path: ".agents/skills/b/SKILL.md", text: "`references/a.md` — a" },
        ],
        [{ path: pagePath, text: "" }],
      ),
    ).toHaveLength(1);
  });
});
