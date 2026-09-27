import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getPositionalPointerFindings } from "#src/services/sweeps/skillDocs/getPositionalPointerFindings";
import { describe, expect, test } from "vitest";

describe(getPositionalPointerFindings, () => {
  const path = ".agents/skills/a/references/a.md";

  test.each(["(above)", "(see below)", "see above", "as above"])("reports %s", (pointer) => {
    expect.hasAssertions();

    expect(getPositionalPointerFindings([{ path, text: ` \n${pointer}` }])).toStrictEqual([
      { detail: "line 2", path, type: SkillDocsFindingType.PositionalPointer },
    ]);
  });

  test("reports nothing for a quoted or backticked pointer, or one inside a fence", () => {
    expect.hasAssertions();

    expect(getPositionalPointerFindings([{ path, text: '"see below" `(above)`\n```\nsee below\n```' }])).toStrictEqual(
      [],
    );
  });
});
