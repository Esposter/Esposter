import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Resident } from "#src/models/world/Resident";

import { useWorldTalks } from "#src/composables/useWorldTalks";
import { GCG_OPEN_ADVENTURE_RANK, GCG_TUTORIAL_QUEST_ID } from "#src/services/gcg/constants";
import { readGcgLevels } from "#src/services/gcg/readGcgLevels";
import { readStandingTalks } from "#src/services/resident/readStandingTalks";
import { flushReads } from "#src/services/shared/flushReads.test";
import { GameLanguage } from "genshin-text";
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
});
