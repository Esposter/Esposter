import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DomainEntranceLandmark } from "genshin-world";

import { readCatalogueAreaPlaceMap } from "#src/services/genshinAssets/domains/readCatalogueAreaPlaceMap";
import { readDomainEntrancePoints } from "#src/services/genshinAssets/domains/readDomainEntrancePoints";
import { writeDomainEntrances } from "#src/services/genshinAssets/domains/writeDomainEntrances";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { DomainKind, LandmarkKind } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/domains/readCatalogueAreaPlaceMap"));
vi.mock(import("#src/services/genshinAssets/domains/readDomainEntrancePoints"));
vi.mock(import("#src/services/genshinAssets/residents/readFittedRegions"));
vi.mock(import("#src/services/genshinAssets/shared/readWorldGroundHeight"));
vi.mock(import("#src/services/genshinAssets/shared/writeWorldData"));
vi.mock(import("#src/services/genshinText/readExcelTable"));

describe(writeDomainEntrances, () => {
  // Ridge Watch's entry and its scene point as the dump holds them, the point in the game's Bishui Plain, area 5
  const entry: ExcelDungeonEntryRow = {
    descriptionCycleRewardList: [],
    dungeonEntryId: 282,
    id: 13,
    sceneId: OPEN_WORLD_SCENE_ID,
    type: "DUNGEN_ENTRY_TYPE_RELIQUARY",
  };
  const point: DumpedScenePoint = {
    $type: "Point",
    areaId: 5,
    tranPos: { x: 1473.9225, y: 243.6, z: -321.23572 },
    tranRot: { y: 270 },
  };
  const position = { x: 1473.92, z: 321.24 };
  const entrance: DomainEntranceLandmark = {
    areaId: "bishui-plain",
    arrival: { heightOffset: 243.6, position, rotation: 1.5708 },
    domainKind: DomainKind.Blessing,
    entryId: 13,
    heightOffset: 243.6,
    id: "domain-entrance-13",
    kind: LandmarkKind.DomainEntrance,
    position,
    rotation: 1.5708,
  };
  const mondstadt: RegionDataFile = { landmarks: [{ areaId: "starfell-valley", position: { x: 0, z: 0 } }] };
  const liyue: RegionDataFile = { landmarks: [] };
  const mondstadtFile = { data: mondstadt, file: "regions/mondstadt.json", region: "mondstadt" };
  const liyueFile = { data: liyue, file: "regions/liyue.json", region: "liyue" };
  // The official map point nearest the entrance is Mondstadt's, as it is in the game's fit
  const regionMapPoints = [{ position: { x: 1473.92, z: -321.24 }, region: "mondstadt" }];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFittedRegions).mockResolvedValue({
      origin: [0, 0, 0],
      regionFiles: [mondstadtFile, liyueFile],
      regionMapPoints,
    });
    vi.mocked(readWorldGroundHeight).mockResolvedValue(() => 0);
    vi.mocked(readDomainEntrancePoints).mockResolvedValue({ "282": point });
    vi.mocked(readCatalogueAreaPlaceMap).mockResolvedValue(new Map([[5, { areaId: "bishui-plain", region: "liyue" }]]));
    vi.mocked(readExcelTable).mockReturnValue([entry]);
    vi.mocked(writeWorldData).mockResolvedValue("");
  });

  test("an entrance in Bishui Plain is filed under Liyue's region and its own area, though the nearest official map point is Mondstadt's", async () => {
    expect.hasAssertions();

    await writeDomainEntrances({ isDryRun: false });

    expect(writeWorldData).toHaveBeenCalledExactlyOnceWith("regions/liyue.json", { landmarks: [entrance] });
  });

  test("an entrance in a region the fit did not place is counted and left out", async () => {
    expect.hasAssertions();

    vi.mocked(readFittedRegions).mockResolvedValueOnce({
      origin: [0, 0, 0],
      regionFiles: [mondstadtFile],
      regionMapPoints,
    });

    const report = await writeDomainEntrances({ isDryRun: false });

    expect(writeWorldData).not.toHaveBeenCalled();
    expect(report).toStrictEqual(
      [
        "mondstadt: 0 domain entrances",
        "0 of 1 domain entrances placed, 0 with no transport point, 1 in no fitted region",
      ].join("\n"),
    );
  });
});
