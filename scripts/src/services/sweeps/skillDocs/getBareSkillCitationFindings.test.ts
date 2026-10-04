import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getBareSkillCitationFindings } from "#src/services/sweeps/skillDocs/getBareSkillCitationFindings";
import { describe, expect, test } from "vitest";

describe(getBareSkillCitationFindings, () => {
  const path = ".agents/skills/a/SKILL.md";
  const skillNames = new Set(["b"]);

  test.each(["(`b`, `references/a.md`)", '(`b`, "a")', "(`b`,  `references/a.md`)", "(`b` ,`references/a.md`)"])(
    "reports %s",
    (text) => {
      expect.hasAssertions();

      expect(getBareSkillCitationFindings([{ path, text }], skillNames)).toStrictEqual([
        { detail: text, path, type: SkillDocsFindingType.BareSkillCitation },
      ]);
    },
  );

  test("reports nothing for the skill cited by name", () => {
    expect.hasAssertions();

    expect(
      getBareSkillCitationFindings([{ path, text: "(the `b` skill, `references/a.md`)" }], skillNames),
    ).toStrictEqual([]);
  });

  test("reports nothing for a backticked token that is no skill", () => {
    expect.hasAssertions();

    expect(getBareSkillCitationFindings([{ path, text: "(`a`, `references/a.md`)" }], skillNames)).toStrictEqual([]);
  });

  test("reports nothing inside a fence", () => {
    expect.hasAssertions();

    expect(
      getBareSkillCitationFindings([{ path, text: "```\n(`b`, `references/a.md`)\n```" }], skillNames),
    ).toStrictEqual([]);
  });
});
