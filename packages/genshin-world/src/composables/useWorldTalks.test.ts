import type { Talk } from "#src/models/dialogue/Talk";
import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { Resident } from "#src/models/world/Resident";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldTalks } from "#src/composables/useWorldTalks";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { regionDataSchema } from "#src/models/world/RegionData";
import { GCG_OPEN_ADVENTURE_RANK, GCG_TUTORIAL_QUEST_ID } from "#src/services/gcg/constants";
import { readGcgLevels } from "#src/services/gcg/readGcgLevels";
import { readStandingTalks } from "#src/services/resident/readStandingTalks";
import { flushReads } from "#src/services/shared/flushReads.test";
import { startTestAdventureRank } from "#src/store/adventureRank.fixture";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { finishTestMainQuests } from "#src/store/quests.fixture";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { startTestWorldSession } from "#src/store/session.fixture";
import { jsonDateParse } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gcg/readGcgLevels"));
vi.mock(import("#src/services/resident/readStandingTalks"));
vi.mock(import("#src/services/resident/StandingTalkTextLoaderMap"));

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
  startTestWorldSession({ gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL });
  startTestAdventureRank(adventureRank);
  finishTestMainQuests(Number(GCG_TUTORIAL_QUEST_ID));
  startTestWorldGround();
  const talks = useWorldTalks({
    getCardGameExp: () => 0,
    getResidents: () => residents,
    getResidentSpot: () => undefined,
  });
  await flushReads();
  return talks;
};

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
  const useSeatedTalks = (
    cardGameExp: number,
    { closeScreen = vi.fn<() => void>(), standingTalks = [] as Talk[] } = {},
  ) => {
    vi.mocked(readGcgLevels).mockResolvedValue({
      challengerGames: { 0: [{ gameId: DUEL_GAME_ID, level: OPENING_LEVEL }] },
      playerLevelLocks: [],
      playerLevels: PLAYER_LEVELS,
    });
    vi.mocked(readStandingTalks).mockResolvedValue(standingTalks);
    startTestWorldSession();
    startTestAdventureRank(GCG_OPEN_ADVENTURE_RANK);
    finishTestMainQuests(Number(GCG_TUTORIAL_QUEST_ID));
    const worldScreenStore = useWorldScreenStore();
    vi.spyOn(worldScreenStore, "closeScreen").mockImplementation(closeScreen);
    startTestWorldGround();
    return useWorldTalks({
      getCardGameExp: () => cardGameExp,
      getResidents: () => [RESIDENT],
      getResidentSpot: () => undefined,
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

  test("a talk that ends is a talk-to for the quests in progress and returns to the world", async () => {
    expect.hasAssertions();

    const closeScreen = vi.fn<() => void>();
    const questEvents: QuestEvent[] = [];
    const standingTalks: Talk[] = [{ id: TALK_ID, lines: [], npcIds: [], startLineId: "line" }];
    const talks = useSeatedTalks(1, { closeScreen, standingTalks });
    const worldSessionStore = useWorldSessionStore();
    worldSessionStore.events.on("questEvent", (questEvent) => {
      questEvents.push(questEvent);
    });
    await flushReads();
    talks.beginTalk(TALK_ID);
    talks.endTalk();

    expect(questEvents).toStrictEqual([{ kind: QuestObjectiveKind.TalkTo, targetId: TALK_ID }]);
    expect(closeScreen).toHaveBeenCalledTimes(1);
  });

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

  test("marjorie's and ellin's duels are not offered below adventure rank 32", async () => {
    expect.hasAssertions();

    const talks = await useMondstadtTalks(DUEL_ADVENTURE_RANK - 1);

    expect([talks.getTalkDuelGameId(MARJORIE_TALK_ID), talks.getTalkDuelGameId(ELLIN_TALK_ID)]).toStrictEqual([
      undefined,
      undefined,
    ]);
  });

  test("marjorie's and ellin's duels are offered from adventure rank 32", async () => {
    expect.hasAssertions();

    const talks = await useMondstadtTalks(DUEL_ADVENTURE_RANK);

    expect([talks.getTalkDuelGameId(MARJORIE_TALK_ID), talks.getTalkDuelGameId(ELLIN_TALK_ID)]).toStrictEqual([
      MARJORIE_DUEL_GAME_ID,
      ELLIN_DUEL_GAME_ID,
    ]);
  });
});
