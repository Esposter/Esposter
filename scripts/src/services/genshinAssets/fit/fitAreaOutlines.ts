import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { CATALOGUE_KEY } from "#src/services/gameData/constants";
import { computeAreaCells } from "#src/services/genshinAssets/fit/computeAreaCells";
import { computeLoopArea } from "#src/services/genshinAssets/fit/computeLoopArea";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import {
  CATALOGUE_FILE,
  TERRAIN_TILE_SIZE,
  WORLD_AREAS_PATH,
  WORLD_DATA_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage } from "genshin-text";
import { catalogueSchema } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The side of the cells an area's outline is traced over, in metres, a sixteenth of a tile
const AREA_OUTLINE_CELL_SIZE = 64;
// How far a traced outline may stray from its cells' own edges, in cells
const AREA_OUTLINE_TOLERANCE = 1;
// Each area's outline in the catalogue, drawn round the tiles its places stand on, since the game ships no area's
// Shape the inventory finds: the waypoints and statues the game's area table files under each of its level-one areas
// (`readSceneTransportPoints`), every tile any of them stands on split between the areas by the point nearest each
// Cell (`computeAreaCells`), and each area's cells traced round, its largest piece kept, in the world's axes round the
// Oak's foot to the metre. An area is the game's level-one area of its English name, and one the table files no point
// Under keeps the outline the file gives it. The catalogue is written back, as the source people edit, and is also its
// Record, with each area's outline as the notes
export const fitAreaOutlines = async (): Promise<GameDataBuild> => {
  const [areasJson, transportPoints, [originX, , originZ], catalogueJson] = await Promise.all([
    readFile(WORLD_AREAS_PATH, "utf8"),
    readSceneTransportPoints(),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFile(join(WORLD_DATA_DIRECTORY, CATALOGUE_FILE), "utf8"),
  ]);
  const textMap = readTextMap(GameLanguage.English);
  const areas = parseMachineJson<WorldArea[]>(areasJson);
  const catalogue = catalogueSchema.parse(parseMachineJson(catalogueJson));
  const levelOneIdMap = new Map(
    areas.filter(({ areaType }) => areaType === WorldAreaType.Level2).map(({ areaID1, areaID2 }) => [areaID2, areaID1]),
  );
  const levelOneNameMap = new Map(
    areas
      .filter(({ areaType }) => areaType === WorldAreaType.Level1)
      .map(({ areaID1, areaNameTextMapHash }) => [textMap.get(String(areaNameTextMapHash)), areaID1]),
  );
  const points = transportPoints.flatMap(({ area, position }) => {
    const levelOneId = area === undefined ? undefined : levelOneIdMap.get(area);
    return levelOneId === undefined ? [] : [{ area: levelOneId, ...position }];
  });
  const { areaCellsMap, corner, width } = computeAreaCells(points, {
    cellSize: AREA_OUTLINE_CELL_SIZE,
    tileSize: TERRAIN_TILE_SIZE,
  });
  const notes: string[] = [];
  // The catalogue is parsed afresh, so each area's outline is written into it in place
  for (const region of catalogue.regions)
    for (const area of region.areas) {
      const levelOneId = levelOneNameMap.get(area.name);
      const cells = levelOneId === undefined ? undefined : areaCellsMap.get(levelOneId);
      if (!cells) continue;
      const loops = traceCellLoops(cells, {
        cellSize: AREA_OUTLINE_CELL_SIZE,
        corner,
        minCells: 0,
        tolerance: AREA_OUTLINE_TOLERANCE,
        width,
      });
      const [loop = []] = loops.toSorted(
        (firstLoop, secondLoop) => computeLoopArea(secondLoop) - computeLoopArea(firstLoop),
      );
      area.outline = loop.map(([x, z]) => ({ x: roundFitted(x - originX, 0), z: roundFitted(originZ - z, 0) }));
      const keptShare = roundFitted((100 * computeLoopArea(loop)) / (cells.length * AREA_OUTLINE_CELL_SIZE ** 2));
      notes.push(
        `${region.id}/${area.id}: ${area.outline.length} corners round ${cells.length} cells, ${keptShare}% kept of ${loops.length} loops`,
      );
    }
  return {
    notes: [...notes, await writeWorldData(CATALOGUE_FILE, catalogue)],
    objects: { [CATALOGUE_KEY]: catalogue },
  };
};
