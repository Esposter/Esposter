import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { SceneGroups } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { readDialogSpeakers } from "#src/services/genshinAssets/residents/readDialogSpeakers";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { writeResidents } from "#src/services/genshinAssets/residents/writeResidents";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";
import { SceneGroupSource } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gameData/readPublishedGameData"));
vi.mock(import("#src/services/genshinAssets/residents/findNearestLandmarkAreaId"));
vi.mock(import("#src/services/genshinAssets/residents/readDialogSpeakers"));
vi.mock(import("#src/services/genshinAssets/residents/readFittedRegions"));
vi.mock(import("#src/services/genshinAssets/shared/writeWorldData"));
vi.mock(import("#src/services/genshinText/readExcelTable"));
vi.mock(import("#src/services/genshinText/readTalkConfigs"));

describe(writeResidents, () => {
  const AREA_ID = "first-area";
  const REGION = "first-region";
  const REGION_FILE = `regions/${REGION}.json`;
  const IDENTITY_TRANSFORM = { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 };
  // The file holds a resident no placement supplies, so the residents the writer computes differ from it and a write is due
  const region: RegionDataFile = {
    landmarks: [],
    residents: [{ areaId: AREA_ID, id: "1", nameTextId: "1", talkId: "1" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFittedRegions).mockResolvedValue({
      origin: [0, 0, 0],
      points: [],
      regionFiles: [{ data: region, file: REGION_FILE, region: REGION }],
      regionMapPoints: [],
      transform: IDENTITY_TRANSFORM,
    });
    vi.mocked(readPublishedGameData).mockResolvedValue({ buildings: {}, groups: {} } satisfies SceneGroups);
    vi.mocked(readDialogSpeakers).mockReturnValue([]);
    vi.mocked(readExcelTable).mockReturnValue([]);
    vi.mocked(readTalkConfigs).mockResolvedValue([]);
    vi.mocked(writeWorldData).mockResolvedValue(REGION_FILE);
  });

  test("a dry run reports the residents it would write and writes no region data", async () => {
    expect.hasAssertions();

    const report = await writeResidents({ isDryRun: true });

    expect(writeWorldData).not.toHaveBeenCalled();
    expect(report).toStrictEqual(
      [
        `${REGION}: 0 placed with talks, 0 with a day spot only, 0 with a night spot`,
        "0 at a crafting bench, 0 with no name, 0 with no talk, 0 repeat placements of a resident already placed, and 0 of 0 placed NPCs in no fitted region",
        "nothing written",
      ].join("\n"),
    );
  });

  test("a building point places the NPC who keeps it at the point", async () => {
    expect.hasAssertions();
    // Mondstadt's General Goods point, whose shop Blanche, NPC 1423, keeps
    const GENERAL_GOODS_POINT_ID = "63";
    const BLANCHE_NPC_ID = 1423;
    const BLANCHE_NAME_TEXT_HASH = 127025653;
    const BLANCHE_TALK_ID = 46406;
    vi.mocked(findNearestLandmarkAreaId).mockReturnValue(AREA_ID);
    vi.mocked(readFittedRegions).mockResolvedValueOnce({
      origin: [0, 0, 0],
      points: [],
      transform: IDENTITY_TRANSFORM,
      regionFiles: [{ data: region, file: REGION_FILE, region: REGION }],
      regionMapPoints: [{ position: { x: 0, z: 0 }, region: REGION }],
    });
    vi.mocked(readPublishedGameData).mockResolvedValueOnce({
      buildings: {
        [GENERAL_GOODS_POINT_ID]: {
          name: "GeneralCargo",
          place: { height: 0, position: { x: 0, z: 0 }, rotationY: 0, source: SceneGroupSource.ScenePoints },
        },
      },
      groups: {},
    } satisfies SceneGroups);
    vi.mocked(readExcelTable).mockReturnValueOnce([
      { id: BLANCHE_NPC_ID, nameTextMapHash: BLANCHE_NAME_TEXT_HASH },
    ] satisfies DumpedNpc[]);
    vi.mocked(readDialogSpeakers).mockReturnValueOnce([{ speakerId: BLANCHE_NPC_ID, talkId: BLANCHE_TALK_ID }]);

    const report = await writeResidents({ isDryRun: true });

    expect(report).toStrictEqual(
      [
        `${REGION}: 1 placed with talks, 1 with a day spot only, 0 with a night spot`,
        "0 at a crafting bench, 0 with no name, 0 with no talk, 0 repeat placements of a resident already placed, and 0 of 1 placed NPCs in no fitted region",
        "nothing written",
      ].join("\n"),
    );
  });

  // A challenger the scene places at a building point, with the talk the dialog names for the NPC
  const seatChallenger = (buildingId: string, npcId: number, nameTextHash: number, talkId: number): void => {
    vi.mocked(findNearestLandmarkAreaId).mockReturnValue(AREA_ID);
    vi.mocked(readFittedRegions).mockResolvedValueOnce({
      origin: [0, 0, 0],
      points: [],
      regionFiles: [{ data: region, file: REGION_FILE, region: REGION }],
      regionMapPoints: [{ position: { x: 0, z: 0 }, region: REGION }],
      transform: IDENTITY_TRANSFORM,
    });
    vi.mocked(readPublishedGameData).mockResolvedValueOnce({
      buildings: {
        [buildingId]: {
          name: "Building",
          place: { height: 0, position: { x: 0, z: 0 }, rotationY: 0, source: SceneGroupSource.ScenePoints },
        },
      },
      groups: {},
    } satisfies SceneGroups);
    vi.mocked(readExcelTable).mockReturnValueOnce([{ id: npcId, nameTextMapHash: nameTextHash }] satisfies DumpedNpc[]);
    vi.mocked(readDialogSpeakers).mockReturnValueOnce([{ speakerId: npcId, talkId }]);
  };

  test("a seated challenger's talk opens the duel", async () => {
    expect.hasAssertions();
    // Ellin keeps no point of her own, so she stands at the Knights' headquarters point, NPC 9704, the duel game her week row names
    const KNIGHTS_HEADQUARTERS_POINT_ID = "54";
    const ELLIN_NPC_ID = 9704;
    const ELLIN_NAME_TEXT_HASH = 2404082984;
    const ELLIN_TALK_ID = 6970401;
    const ELLIN_DUEL_GAME_ID = 1031;
    seatChallenger(KNIGHTS_HEADQUARTERS_POINT_ID, ELLIN_NPC_ID, ELLIN_NAME_TEXT_HASH, ELLIN_TALK_ID);

    await writeResidents({ isDryRun: false });

    expect(writeWorldData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      expect.objectContaining({
        residents: [
          expect.objectContaining({
            duelGameId: ELLIN_DUEL_GAME_ID,
            id: String(ELLIN_NPC_ID),
            talkId: String(ELLIN_TALK_ID),
          }),
        ],
      }),
    );
  });

  test("a seated challenger's week game is written with its game, the level it is offered at, and its reward", async () => {
    expect.hasAssertions();
    // Kimiya stands at Sumeru's crafting bench, building 526, and his week row names game 1103 at level 5, while his duel sits at
    // His seat, game 1104
    const CRAFTING_BENCH_BUILDING_ID = "526";
    const KIMIYA_NPC_ID = 9715;
    const KIMIYA_NAME_TEXT_HASH = 1;
    const KIMIYA_TALK_ID = 9715001;
    const KIMIYA_DUEL_GAME_ID = 1104;
    const KIMIYA_WEEK_GAME = { gameId: 1103, gcgLevel: 5, luckyCoins: 900, playerExp: 200 };
    seatChallenger(CRAFTING_BENCH_BUILDING_ID, KIMIYA_NPC_ID, KIMIYA_NAME_TEXT_HASH, KIMIYA_TALK_ID);

    await writeResidents({ isDryRun: false });

    expect(writeWorldData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      expect.objectContaining({
        residents: [
          expect.objectContaining({
            duelGameId: KIMIYA_DUEL_GAME_ID,
            id: String(KIMIYA_NPC_ID),
            weekGame: KIMIYA_WEEK_GAME,
          }),
        ],
      }),
    );
  });

  test("a run writes a region whose residents changed", async () => {
    expect.hasAssertions();

    await writeResidents({ isDryRun: false });

    expect(writeWorldData).toHaveBeenCalledExactlyOnceWith(REGION_FILE, { ...region, residents: [] });
  });
});
