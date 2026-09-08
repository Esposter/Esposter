import { getDocsRouteFindings } from "#scripts/sweeps/skillDocs/getDocsRouteFindings";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";
import { describe, expect, test } from "vitest";

describe(getDocsRouteFindings, () => {
  const text = "see `/docs/architecture/a`";

  test("reports a docs route named by a skill that does not own the form", () => {
    expect.hasAssertions();

    const path = ".agents/skills/a/SKILL.md";

    expect(getDocsRouteFindings([{ path, text }])).toStrictEqual([
      { detail: "line 1", path, type: SkillDocsFindingType.DocsRoute },
    ]);
  });

  test("reports nothing from the two skills that teach the route form", () => {
    expect.hasAssertions();

    expect(
      getDocsRouteFindings([
        { path: ".agents/skills/docs/SKILL.md", text },
        { path: ".agents/skills/readme-standards/SKILL.md", text },
      ]),
    ).toStrictEqual([]);
  });
});
