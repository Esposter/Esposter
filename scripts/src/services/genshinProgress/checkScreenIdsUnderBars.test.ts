import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { checkScreenIdsUnderBars } from "#src/services/genshinProgress/checkScreenIdsUnderBars";
import { describe, expect, test } from "vitest";

describe(checkScreenIdsUnderBars, () => {
  test("a screen's check is met when every id is under its bar", () => {
    expect.hasAssertions();

    const parityIds = ["quest-screen", "quest-screen-list", "quest-screen-details"];
    const approvals = new Map([
      ["quest-screen", DEFAULT_APPROVAL],
      ["quest-screen-details", DEFAULT_APPROVAL],
      ["quest-screen-list", DEFAULT_APPROVAL],
    ]);
    const means = new Map([
      ["quest-screen", 0.5],
      ["quest-screen-details", 0.7],
      ["quest-screen-list", 2.11],
    ]);

    expect(checkScreenIdsUnderBars("quest", parityIds, means, approvals)).toStrictEqual({
      name: "screen quest: every parity id under its bar",
      notes: ["quest-screen-list scores 2.11%, not under its 1% bar"],
      state: GenshinExitCheckState.NotMet,
    });
  });
});
