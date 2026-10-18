import type { Landmark } from "#src/models/world/Landmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { STORMTERROR_INTRO_QUEST_IDS } from "#src/services/bosses/constants";
import { computeUnlockedJumpLandmarks } from "#src/services/map/computeUnlockedJumpLandmarks";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const ARRIVAL = { heightOffset: 0, position: { x: 1, z: 2 }, rotation: 0 };
const domainEntrance: Landmark = {
  areaId: "area-1",
  arrival: ARRIVAL,
  domainKind: DomainKind.Blessing,
  entryId: 1,
  heightOffset: 0,
  id: "domain-entrance-1",
  kind: LandmarkKind.DomainEntrance,
  position: { x: 1, z: 2 },
  rotation: 0,
  titleTextKey: GameTextKey.DomainEntrance24,
};

// A weekly boss's Trounce Domain entrance, whose entry id names the boss whose introducing quests open it
const weeklyEntrance: Landmark = {
  ...domainEntrance,
  domainKind: DomainKind.Trounce,
  entryId: 1006,
  id: "weekly-entrance",
};
const noQuests = new Set<string>();

describe(computeUnlockedJumpLandmarks, () => {
  test("an unlocked entrance joins the jumps", () => {
    expect.hasAssertions();

    expect(computeUnlockedJumpLandmarks([domainEntrance], new Set([domainEntrance.id]), noQuests)).toStrictEqual([
      domainEntrance,
    ]);
  });

  test("a locked entrance is not a jump target", () => {
    expect.hasAssertions();

    expect(computeUnlockedJumpLandmarks([domainEntrance], new Set(), noQuests)).toStrictEqual([]);
  });

  test("a weekly boss's domain opens once its introducing quest is done", () => {
    expect.hasAssertions();

    expect(
      computeUnlockedJumpLandmarks([weeklyEntrance], new Set(), new Set(STORMTERROR_INTRO_QUEST_IDS.map(String))),
    ).toStrictEqual([weeklyEntrance]);
  });

  // A weekly entrance takes no resonance, so a resonated one is still locked until its quests are done
  test("a weekly boss's domain is locked before its introducing quest", () => {
    expect.hasAssertions();

    expect(computeUnlockedJumpLandmarks([weeklyEntrance], new Set([weeklyEntrance.id]), noQuests)).toStrictEqual([]);
  });
});
