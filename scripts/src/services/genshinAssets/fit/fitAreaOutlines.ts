import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";
import type { WorldAreaPolygonFile } from "#src/models/genshinAssets/world/WorldAreaPolygonFile";
import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { CATALOGUE_KEY } from "#src/services/gameData/constants";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import {
  CATALOGUE_FILE,
  CATALOGUE_PATH,
  OPEN_WORLD_SCENE_ID,
  WORLD_AREA_POLYGONS_PATH,
  WORLD_AREAS_TABLE_NAME,
} from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage } from "genshin-text";
import { AreaTerrainType, catalogueSchema } from "genshin-world";
import { readFile } from "node:fs/promises";

// Each area's and subarea's outline in the catalogue, the game's own: the polygons the community's dump holds for the
// Open world's areas, carried into the world's axes round the oak's foot to the metre. An area is the game's level-one
// Area of its English name and takes its polygon, and a subarea takes the polygon of every level-two area of its name
// In that area, since the game splits some places into several (Sumeru City's lower and upper town), and the kind of
// Ground the game's table files them under, a city's among them. An area the file holds no polygon for keeps the
// Outline the catalogue gives it, and a subarea the table files no row for takes no outline and no terrain.
// The catalogue is written back, as the source people edit, and is also its record, with what was outlined as the notes
export const fitAreaOutlines = async ({ isDryRun }: { isDryRun: boolean }): Promise<GameDataBuild> => {
  const [polygonsJson, [originX, , originZ], catalogueJson] = await Promise.all([
    readFile(WORLD_AREA_POLYGONS_PATH, "utf8"),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFile(CATALOGUE_PATH, "utf8"),
  ]);
  const textMap = readTextMap(GameLanguage.English);
  const areas = readExcelTable<WorldArea>(WORLD_AREAS_TABLE_NAME).filter(
    ({ sceneID }) => sceneID === OPEN_WORLD_SCENE_ID,
  );
  const { level1Areas } = parseMachineJson<WorldAreaPolygonFile>(polygonsJson);
  const catalogue = catalogueSchema.parse(parseMachineJson(catalogueJson));
  const toOutline = ({ roadPoints }: { roadPoints: readonly GroundPoint[] }): GroundPoint[] =>
    roadPoints.map(({ x, z }) => ({ x: roundFitted(x - originX, 0), z: roundFitted(originZ - z, 0) }));
  const levelOneOutlineMap = new Map(
    level1Areas.map(({ level1Area: { id1, polygonData } }) => [id1, toOutline(polygonData)]),
  );
  const levelTwoOutlineMap = new Map(
    level1Areas.flatMap(({ level2Areas = [] }) =>
      level2Areas.map(({ id2, polygonData }) => [id2, toOutline(polygonData)] as const),
    ),
  );
  const getName = ({ areaNameTextMapHash }: WorldArea): string | undefined => textMap.get(String(areaNameTextMapHash));
  const levelOneIdMap = new Map(
    areas.filter(({ areaType }) => areaType === WorldAreaType.Level1).map((area) => [getName(area), area.areaID1]),
  );
  const levelTwoAreas = areas.filter(({ areaType }) => areaType === WorldAreaType.Level2);
  // The areas the game's polygon outlines, and those whose own outline the catalogue keeps
  const gameAreaIds: string[] = [];
  const keptAreaIds: string[] = [];
  // The catalogue is parsed afresh, so each outline is written into it in place
  for (const region of catalogue.regions)
    for (const area of region.areas) {
      const levelOneId = levelOneIdMap.get(area.name);
      const outline = levelOneId === undefined ? undefined : levelOneOutlineMap.get(levelOneId);
      if (outline) {
        area.outline = outline;
        gameAreaIds.push(area.id);
      } else if (area.outline.length > 0) keptAreaIds.push(`${region.id}/${area.id}`);
      for (const subarea of area.subareas) {
        const rows = levelTwoAreas.filter((row) => row.areaID1 === levelOneId && getName(row) === subarea.name);
        subarea.areaTerrainType = rows[0]?.terrainType ?? AreaTerrainType.None;
        subarea.outlines = rows.flatMap(({ areaID2 }) => {
          const subareaOutline = levelTwoOutlineMap.get(areaID2);
          return subareaOutline ? [subareaOutline] : [];
        });
      }
    }
  const catalogueAreas = catalogue.regions.flatMap((region) => region.areas);
  const subareas = catalogueAreas.flatMap((area) => area.subareas);
  const outlinedSubareas = subareas.filter(({ outlines }) => outlines.length > 0);
  const cities = subareas.filter(({ areaTerrainType }) => areaTerrainType === AreaTerrainType.City);
  const outlinedCities = cities.filter(({ outlines }) => outlines.length > 0);
  const notes = [
    `${gameAreaIds.length} of ${catalogueAreas.length} areas take the game's outline, ${keptAreaIds.length} keep the catalogue's (${keptAreaIds.join(", ")})`,
    `${outlinedSubareas.length} of ${subareas.length} subareas take the game's outlines, among them ${outlinedCities.length} of the ${cities.length} cities the game marks`,
  ];
  return {
    notes: [...notes, await writeWorldData(CATALOGUE_FILE, catalogue, { isDryRun })],
    objects: { [CATALOGUE_KEY]: catalogue },
  };
};
