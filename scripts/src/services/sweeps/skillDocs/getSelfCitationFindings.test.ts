import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getSelfCitationFindings } from "#src/services/sweeps/skillDocs/getSelfCitationFindings";
import { describe, expect, test } from "vitest";

describe(getSelfCitationFindings, () => {
  const path = ".agents/skills/a/references/a.md";
  const skillNames = new Set(["a", "b"]);

  test("reports a page citing itself", () => {
    expect.hasAssertions();

    expect(getSelfCitationFindings([{ path, text: "`references/a.md`" }], skillNames)).toStrictEqual([
      { detail: "`references/a.md`", path, type: SkillDocsFindingType.SelfCitation },
    ]);
  });

  test("reports nothing for a citation of another page", () => {
    expect.hasAssertions();

    expect(getSelfCitationFindings([{ path, text: "`references/b.md`" }], skillNames)).toStrictEqual([]);
  });

  test("reports nothing when the line names another skill", () => {
    expect.hasAssertions();

    expect(getSelfCitationFindings([{ path, text: "the `b` skill, `references/a.md`" }], skillNames)).toStrictEqual([]);
  });
});
