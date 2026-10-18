import { ExpeditionPassiveKind, ExpeditionRegion } from "genshin-world";
import { describe, expect, test } from "vitest";

import { parseExpeditionPassive } from "#src/services/genshinAssets/expeditions/parseExpeditionPassive";

describe(parseExpeditionPassive, () => {
  test("a time talent reads its region and the percent of time it saves from the game's description", () => {
    expect.hasAssertions();
    expect(
      parseExpeditionPassive("When dispatched on an expedition in Mondstadt, time consumed is reduced by 25%."),
    ).toStrictEqual({ kind: ExpeditionPassiveKind.Time, percent: 25, region: ExpeditionRegion.Mondstadt });
  });

  test("a reward talent reads its region, the percent it adds and the hours it needs from the game's description", () => {
    expect.hasAssertions();
    expect(
      parseExpeditionPassive("Gains 25% more rewards when dispatched on a Liyue Expedition for 20 hours."),
    ).toStrictEqual({ hours: 20, kind: ExpeditionPassiveKind.Reward, percent: 25, region: ExpeditionRegion.Liyue });
  });

  test("a description that names no expedition is no expedition talent", () => {
    expect.hasAssertions();
    expect(parseExpeditionPassive("Gains 25% more ATK.")).toBeUndefined();
  });
});
