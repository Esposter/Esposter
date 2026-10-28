import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Resident } from "#src/models/world/Resident";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { regionDataSchema } from "#src/models/world/RegionData";
import { GCG_OPEN_ADVENTURE_RANK, GCG_TUTORIAL_QUEST_ID } from "#src/services/gcg/constants";
import { readGcgLevels } from "#src/services/gcg/readGcgLevels";
import { readStandingTalks } from "#src/services/resident/readStandingTalks";
import { flushReads } from "#src/services/shared/flushReads.test";
import { jsonDateParse } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { computed, shallowRef } from "vue";

vi.mock(import("#src/services/gcg/readGcgLevels"));
vi.mock(import("#src/services/resident/readStandingTalks"));
vi.mock(import("#src/services/resident/StandingTalkTextLoaderMap"));

describe(useWorldTalks, () => {
  const DUEL_GAME_ID = 1;
  const OPENING_LEVEL = 2;
  const TALK_ID = "talkId";
  // Made-up levels: the first from no EXP, then the second from the EXP that opens the duel's game
  const PLAYER_LEVELS: GcgPlayerLevel[] = [
    { exp: 0, level: 1 },
    { exp: 1, level: OPENING_LEVEL },
  ];
  const RESIDENT: Resident = {
    areaId: "areaId",
    duelGameId: DUEL_GAME_ID,
    id: "id",
    nameTextId: "nameTextId",
    talkId: TALK_ID,
  };

  // A resident seated at the duel, with the card game's EXP the player holds, read as the world opens
  const useSeatedTalks = (cardGameExp: number) => {
    vi.mocked(readGcgLevels).mockResolvedValue({
      challengerGames: { 0: [{ gameId: DUEL_GAME_ID, level: OPENING_LEVEL }] },
      playerLevelLocks: [],
      playerLevels: PLAYER_LEVELS,
    });
    vi.mocked(readStandingTalks).mockResolvedValue([]);
    return useWorldTalks({
      gameDataBaseUrl: "",
      getAdventureRank: () => GCG_OPEN_ADVENTURE_RANK,
      getCardGameExp: () => cardGameExp,
      getCompletedMainQuestIds: () => new Set([GCG_TUTORIAL_QUEST_ID]),
      getGroundHeight: () => 0,
      getResidents: () => [RESIDENT],
      getResidentSpot: () => undefined,
      language: GameLanguage.English,
      nameText: {},
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      questsOffered: computed<Quest[]>(() => []),
      questTextMap: shallowRef<Record<string, string>>({}),
    });
  };

  // Marjorie and Ellin, seated on Mondstadt's residents by their talks, and the duel each seat is at. Their games are at
  // The first Player Level, so the rank is the only gate left to them once the tutorial is finished
  const MARJORIE_TALK_ID = "40172";
  const MARJORIE_DUEL_GAME_ID = 1021;
  const ELLIN_TALK_ID = "6970401";
  const ELLIN_DUEL_GAME_ID = 1031;
  // The Adventure Rank the game opens the card game's duels at
  const DUEL_ADVENTURE_RANK = 32;

  // Mondstadt's residents as its region file seats them, read with the real card game levels, at an Adventure Rank with
  // The tutorial finished
  const useMondstadtTalks = async (adventureRank: number) => {
    const { readGcgLevels: readRealGcgLevels } = await vi.importActual<{ readGcgLevels: typeof readGcgLevels }>(
      "#src/services/gcg/readGcgLevels",
    );
    vi.mocked(readGcgLevels).mockResolvedValue(await readRealGcgLevels(GAME_DATA_LOCAL_BASE_URL));
    vi.mocked(readStandingTalks).mockResolvedValue([]);
    const { residents } = regionDataSchema.parse(
      jsonDateParse(await readFile(join(import.meta.dirname, "../data/regions/mondstadt.json"), "utf8")),
    );
    const talks = useWorldTalks({
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      getAdventureRank: () => adventureRank,
      getCardGameExp: () => 0,
      getCompletedMainQuestIds: () => new Set([GCG_TUTORIAL_QUEST_ID]),
      getGroundHeight: () => 0,
      getResidents: () => residents,
      getResidentSpot: () => undefined,
      language: GameLanguage.English,
      nameText: {},
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      questsOffered: computed<Quest[]>(() => []),
      questTextMap: shallowRef<Record<string, string>>({}),
    });
    await flushReads();
    return talks;
  };

  test("a game opens once the Player Level reaches its level", async () => {
    expect.hasAssertions();

    const talks = useSeatedTalks(1);
    await flushReads();

    expect(talks.getTalkDuelGameId(TALK_ID)).toBe(DUEL_GAME_ID);
  });

  test("a game above the Player Level is not offered", async () => {
    expect.hasAssertions();

    const talks = useSeatedTalks(0);
    await flushReads();

    expect(talks.getTalkDuelGameId(TALK_ID)).toBeUndefined();
  });

  test("Marjorie's and Ellin's duels are not offered below Adventure Rank 32", async () => {
    expect.hasAssertions();

    const talks = await useMondstadtTalks(DUEL_ADVENTURE_RANK - 1);

    expect([talks.getTalkDuelGameId(MARJORIE_TALK_ID), talks.getTalkDuelGameId(ELLIN_TALK_ID)]).toStrictEqual([
      undefined,
      undefined,
    ]);
  });

  test("Marjorie's and Ellin's duels are offered from Adventure Rank 32", async () => {
    expect.hasAssertions();

    const talks = await useMondstadtTalks(DUEL_ADVENTURE_RANK);

    expect([talks.getTalkDuelGameId(MARJORIE_TALK_ID), talks.getTalkDuelGameId(ELLIN_TALK_ID)]).toStrictEqual([
      MARJORIE_DUEL_GAME_ID,
      ELLIN_DUEL_GAME_ID,
    ]);
  });
});
