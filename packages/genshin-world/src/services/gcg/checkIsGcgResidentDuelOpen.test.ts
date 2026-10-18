import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";
import type { Resident } from "#src/models/world/Resident";

import { checkIsGcgResidentDuelOpen } from "#src/services/gcg/checkIsGcgResidentDuelOpen";
import { describe, expect, test } from "vitest";

describe(checkIsGcgResidentDuelOpen, () => {
  const RESIDENT_ID = "9715";
  const WEEK_GAME_ID = 1104;
  const WORLD_GAME_ID = 11_004;
  const challengerGames: Record<string, GcgChallengerGame[]> = {
    [RESIDENT_ID]: [
      { gameId: 1101, level: 1 },
      { gameId: WEEK_GAME_ID, level: 7 },
    ],
  };
  const weekResident: Resident = {
    areaId: "1",
    duelGameId: WEEK_GAME_ID,
    id: RESIDENT_ID,
    nameTextId: "1",
    talkId: "6971501",
    weekGames: [{ gameId: 1101, gcgLevel: 1, luckyCoins: 100, playerExp: 50 }],
  };
  const worldResident: Resident = {
    areaId: "1",
    duelGameId: WORLD_GAME_ID,
    duelTalkId: "6143506",
    id: "1435",
    nameTextId: "1",
    talkId: "40172",
  };

  test("a resident with no week games is no challenger, so its duel is open whatever the Player Level", () => {
    expect.hasAssertions();
    expect(checkIsGcgResidentDuelOpen(worldResident, undefined, 0)).toBe(true);
  });

  test("a challenger's duel is closed until its challengers are read", () => {
    expect.hasAssertions();
    expect(checkIsGcgResidentDuelOpen(weekResident, undefined, 10)).toBe(false);
  });

  test.each([
    [0, false],
    [6, false],
    [7, true],
  ])("a challenger's duel at level %i opens when the Player Level reaches its level: %s", (playerLevel, isOpen) => {
    expect.hasAssertions();
    expect(checkIsGcgResidentDuelOpen(weekResident, challengerGames, playerLevel)).toBe(isOpen);
  });

  test("a challenger's duel is closed when the resident has no duel to offer", () => {
    expect.hasAssertions();
    expect(checkIsGcgResidentDuelOpen({ ...weekResident, duelGameId: undefined }, challengerGames, 10)).toBe(false);
  });
});
