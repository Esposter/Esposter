import type { ResidentDuel } from "#src/models/genshinAssets/residents/ResidentDuel";
import type { ResidentWeekGame } from "genshin-world";

import { toResidentSeats } from "#src/services/genshinAssets/residents/toResidentSeats";
import { describe, expect, test } from "vitest";

describe(toResidentSeats, () => {
  const DUEL_MAP = new Map<string, ResidentDuel>([["1435", { duelGameId: 11_004, duelTalkId: "6143506" }]]);
  const WEEK_GAMES_MAP = new Map<string, ResidentWeekGame[]>([
    ["9715", [{ gameId: 1103, gcgLevel: 5, luckyCoins: 900, playerExp: 200 }]],
  ]);

  test("a world-level duelist is seated at its world-level game and talk, which replace the hand seat", () => {
    expect.hasAssertions();

    expect(toResidentSeats("1435", DUEL_MAP, WEEK_GAMES_MAP)).toStrictEqual({
      duelGameId: 11_004,
      duelTalkId: "6143506",
      weekGames: undefined,
    });
  });

  test("a week NPC with no world-level row keeps its hand-seated duel and gets its week games", () => {
    expect.hasAssertions();

    expect(toResidentSeats("9715", DUEL_MAP, WEEK_GAMES_MAP)).toStrictEqual({
      duelGameId: 1104,
      duelTalkId: undefined,
      weekGames: [{ gameId: 1103, gcgLevel: 5, luckyCoins: 900, playerExp: 200 }],
    });
  });

  test("a resident with neither a world-level row nor a hand seat gets no seat", () => {
    expect.hasAssertions();

    expect(toResidentSeats("1", DUEL_MAP, WEEK_GAMES_MAP)).toStrictEqual({
      duelGameId: undefined,
      duelTalkId: undefined,
      weekGames: undefined,
    });
  });
});
