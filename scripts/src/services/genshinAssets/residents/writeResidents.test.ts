import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { SceneGroups } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readDialogSpeakers } from "#src/services/genshinAssets/residents/readDialogSpeakers";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { writeResidents } from "#src/services/genshinAssets/residents/writeResidents";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gameData/readPublishedGameData"));
vi.mock(import("#src/services/genshinAssets/residents/readDialogSpeakers"));
vi.mock(import("#src/services/genshinAssets/residents/readFittedRegions"));
vi.mock(import("#src/services/genshinAssets/shared/writeWorldData"));
vi.mock(import("#src/services/genshinText/readExcelTable"));
vi.mock(import("#src/services/genshinText/readTalkConfigs"));

describe(writeResidents, () => {
  const AREA_ID = "first-area";
  const REGION = "first-region";
  const REGION_FILE = `regions/${REGION}.json`;
  // The file holds a resident no placement supplies, so the residents the writer computes differ from it and a write is due
  const region: RegionDataFile = {
    landmarks: [],
    residents: [{ areaId: AREA_ID, id: "1", nameTextId: "1", talkId: "1" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFittedRegions).mockResolvedValue({
      origin: [0, 0, 0],
      regionFiles: [{ data: region, file: REGION_FILE, region: REGION }],
      regionMapPoints: [],
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

  test("a run writes a region whose residents changed", async () => {
    expect.hasAssertions();

    await writeResidents({ isDryRun: false });

    expect(writeWorldData).toHaveBeenCalledExactlyOnceWith(REGION_FILE, { ...region, residents: [] });
  });
});
