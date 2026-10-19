import { parseExpeditionPassive } from "#src/services/genshinAssets/expeditions/parseExpeditionPassive";
import { ExpeditionPassiveKind, ExpeditionRegion } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(parseExpeditionPassive, () => {
  test("a time talent reads its region and the percent of time it saves from the game's description", () => {
    expect.hasAssertions();
    expect(
      parseExpeditionPassive("When dispatched on an expedition in Mondstadt, time consumed is reduced by 3%."),
    ).toStrictEqual({ kind: ExpeditionPassiveKind.Time, percent: 3, region: ExpeditionRegion.Mondstadt });
  });

  test("a reward talent reads its region, the percent it adds and the hours it needs from the game's description", () => {
    expect.hasAssertions();
    expect(
      parseExpeditionPassive("Gains 4% more rewards when dispatched on a Liyue Expedition for 5 hours."),
    ).toStrictEqual({ hours: 5, kind: ExpeditionPassiveKind.Reward, percent: 4, region: ExpeditionRegion.Liyue });
  });

  test("a description that names no expedition is no expedition talent", () => {
    expect.hasAssertions();
    expect(parseExpeditionPassive("Gains 25% more ATK.")).toBeUndefined();
  });
});
