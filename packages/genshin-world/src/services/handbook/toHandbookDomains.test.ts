import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { STORMTERROR_INTRO_QUEST_IDS } from "#src/services/bosses/constants";
import { markWeeklyBossTopClear } from "#src/services/bosses/markWeeklyBossTopClear";
import { toHandbookDomains } from "#src/services/handbook/toHandbookDomains";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

// A weekly boss's entrance, whose entry id is the one the weekly boss's domain is read by
const WEEKLY_ENTRY_ID = 1006;

const entrance = (overrides: Partial<DomainEntranceLandmark>): DomainEntranceLandmark => ({
  arrival: { heightOffset: 0, position: { x: 0, z: 0 }, rotation: 0 },
  areaId: "fixture-area",
  domainKind: DomainKind.Blessing,
  entryId: 7,
  heightOffset: 0,
  id: "fixture-blessing",
  kind: LandmarkKind.DomainEntrance,
  position: { x: 0, z: 0 },
  rotation: 0,
  titleTextKey: GameTextKey.DomainEntrance24,
  ...overrides,
});
const weeklyEntrance = entrance({ domainKind: DomainKind.Trounce, entryId: WEEKLY_ENTRY_ID, id: "fixture-weekly" });
const introDone = new Set(STORMTERROR_INTRO_QUEST_IDS.map(String));
const none = new Set<string>();
const flags = ({ isFirstClearClaimable, isLocked, isQuickChallengeable }: HandbookDomain) => ({
  isFirstClearClaimable,
  isLocked,
  isQuickChallengeable,
});

describe(toHandbookDomains, () => {
  test("a locked weekly boss is quick challenged from Adventure Rank 40", () => {
    expect.hasAssertions();

    const [row] = toHandbookDomains([weeklyEntrance], {
      adventureRank: 40,
      clearedDomainIds: none,
      completedMainQuestIds: none,
      unlockedLandmarkIds: none,
    });

    expect(flags(row)).toStrictEqual({ isFirstClearClaimable: false, isLocked: true, isQuickChallengeable: true });
  });

  test("a locked weekly boss cannot be quick challenged below Adventure Rank 40", () => {
    expect.hasAssertions();

    const [row] = toHandbookDomains([weeklyEntrance], {
      adventureRank: 39,
      clearedDomainIds: none,
      completedMainQuestIds: none,
      unlockedLandmarkIds: none,
    });

    expect(flags(row)).toStrictEqual({ isFirstClearClaimable: false, isLocked: true, isQuickChallengeable: false });
  });

  test("a weekly boss whose introducing quests are done is open, so there is nothing to quick challenge", () => {
    expect.hasAssertions();

    const [row] = toHandbookDomains([weeklyEntrance], {
      adventureRank: 40,
      clearedDomainIds: none,
      completedMainQuestIds: introDone,
      unlockedLandmarkIds: none,
    });

    expect(flags(row)).toStrictEqual({ isFirstClearClaimable: false, isLocked: false, isQuickChallengeable: false });
  });

  test("a weekly boss whose highest difficulty is cleared shows its first clear to claim", () => {
    expect.hasAssertions();

    const [row] = toHandbookDomains([weeklyEntrance], {
      adventureRank: 40,
      clearedDomainIds: markWeeklyBossTopClear(none, WEEKLY_ENTRY_ID),
      completedMainQuestIds: introDone,
      unlockedLandmarkIds: none,
    });

    expect(flags(row)).toStrictEqual({ isFirstClearClaimable: true, isLocked: false, isQuickChallengeable: false });
  });

  test("another domain is locked by its landmark and never quick challenged or claimed", () => {
    expect.hasAssertions();

    const blessing = entrance({});
    const [locked, unlocked] = toHandbookDomains([blessing, entrance({ id: "fixture-open" })], {
      adventureRank: 40,
      clearedDomainIds: markWeeklyBossTopClear(none, 7),
      completedMainQuestIds: none,
      unlockedLandmarkIds: new Set(["fixture-open"]),
    });

    expect(flags(locked)).toStrictEqual({ isFirstClearClaimable: false, isLocked: true, isQuickChallengeable: false });
    expect(flags(unlocked)).toStrictEqual({
      isFirstClearClaimable: false,
      isLocked: false,
      isQuickChallengeable: false,
    });
  });
});
