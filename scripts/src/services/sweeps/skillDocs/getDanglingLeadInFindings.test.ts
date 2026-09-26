import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getDanglingLeadInFindings } from "#src/services/sweeps/skillDocs/getDanglingLeadInFindings";
import { describe, expect, test } from "vitest";

describe(getDanglingLeadInFindings, () => {
  const path = ".agents/skills/a/references/a.md";

  test("reports a page whose last line ends on a colon", () => {
    expect.hasAssertions();

    expect(getDanglingLeadInFindings([{ path, text: " \n:\n" }])).toStrictEqual([
      { detail: ":", path, type: SkillDocsFindingType.DanglingLeadIn },
    ]);
  });

  test("reports nothing for a page whose lead-in is followed by what it introduces", () => {
    expect.hasAssertions();

    expect(getDanglingLeadInFindings([{ path, text: ":\na" }])).toStrictEqual([]);
  });
});
