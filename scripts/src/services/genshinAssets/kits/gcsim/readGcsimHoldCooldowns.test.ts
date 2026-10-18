import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

import { readGcsimHoldCooldowns } from "#src/services/genshinAssets/kits/gcsim/readGcsimHoldCooldowns";
import { describe, expect, test } from "vitest";

const SKILL_SOURCE = [
  "package bennett",
  "",
  "func (c *char) skill(level int) {",
  "	var idx, cd, cdDelay int",
  "	switch level {",
  "	case 1:",
  "		idx = 1",
  "		cd = 7.5 * 60",
  "		cdDelay = 43",
  "	case 2:",
  "		idx = 3",
  "		cd = 10 * 60",
  "		cdDelay = 110",
  "	default:",
  '		panic("level")',
  "	}",
  "	c.SetCDWithDelay(action.ActionSkill, c.a4CD(c.a1(cd)), cdDelay)",
  "}",
].join("\n");

describe(readGcsimHoldCooldowns, () => {
  test("reads the cooldown each case of the switch sets the local the cooldown call passes, in frames", () => {
    expect.hasAssertions();

    const constantMap = new Map<string, GoConstant>();

    expect(readGcsimHoldCooldowns([{ path: "skill.go", source: SKILL_SOURCE }], constantMap)).toStrictEqual([
      { file: "skill.go", frames: 450, line: 8 },
      { file: "skill.go", frames: 600, line: 12 },
    ]);
  });

  test("gives none where the cooldown call passes a literal, or a local no case of a switch sets", () => {
    expect.hasAssertions();

    const constantMap = new Map<string, GoConstant>();
    const literalSource = SKILL_SOURCE.replace(
      "c.SetCDWithDelay(action.ActionSkill, c.a4CD(c.a1(cd)), cdDelay)",
      "c.SetCD(action.ActionSkill, 600)",
    );
    const unsetSource = SKILL_SOURCE.replace("cd = 10 * 60", "idx = 3");

    expect(readGcsimHoldCooldowns([{ path: "skill.go", source: literalSource }], constantMap)).toStrictEqual([]);
    expect(readGcsimHoldCooldowns([{ path: "skill.go", source: unsetSource }], constantMap)).toStrictEqual([]);
  });
});
