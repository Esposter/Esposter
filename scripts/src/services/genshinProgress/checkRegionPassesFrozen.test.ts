import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { HELD_YES, PARITY_PASS_ORDER } from "#src/services/genshinParity/passes/constants";
import { checkRegionPassesFrozen } from "#src/services/genshinProgress/checkRegionPassesFrozen";
import { GENSHIN_OPTIONAL_PASSES } from "#src/services/genshinProgress/constants";
import { describe, expect, test } from "vitest";

describe(checkRegionPassesFrozen, () => {
  test("A region's passes are not measurable where only a pass its scene may not owe has no row", () => {
    expect.hasAssertions();

    const report = PARITY_PASS_ORDER.filter((pass) => !GENSHIN_OPTIONAL_PASSES.includes(pass))
      .map((pass) => `| ${pass} |  | 0 | 0 |  | ${HELD_YES} |`)
      .join("\n");

    expect(checkRegionPassesFrozen("mondstadt", report)).toStrictEqual({
      name: "region mondstadt: passes frozen",
      notes: [
        "Motion has no row: not owed or not run, which the report does not record",
        "Audio has no row: not owed or not run, which the report does not record",
      ],
      state: GenshinExitCheckState.NotMeasurable,
    });
  });
});
