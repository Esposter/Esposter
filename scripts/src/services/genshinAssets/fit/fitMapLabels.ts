import type { MapLabel } from "#src/models/genshinAssets/world/MapLabel";
import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";
import type { WorldAreaPolygonFile } from "#src/models/genshinAssets/world/WorldAreaPolygonFile";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { toCatalogueOutline } from "#src/services/genshinAssets/fit/toCatalogueOutline";
import { toMapLabel } from "#src/services/genshinAssets/fit/toMapLabel";
import {
  MAP_LABELS_KEY,
  OPEN_WORLD_SCENE_ID,
  WORLD_AREA_POLYGONS_PATH,
  WORLD_AREAS_TABLE_NAME,
} from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// Every open-world level-two area the game outlines gets a label at its outline's mean in the catalogue's axes.
// The labels are rounded to the same origin the outlines are.
// A level-two area the table files no row for, or the polygon file holds no outline for, has no label.
// Its record is written under `mapLabels/subareas`, and its names are published with the names
export const fitMapLabels = async (): Promise<GameDataBuild> => {
  const [polygonsJson, origin] = await Promise.all([
    readFile(WORLD_AREA_POLYGONS_PATH, "utf8"),
    readWorldOrigin(DerivedAssetComponent.Windrise),
  ]);
  const levelTwoRows = readExcelTable<WorldArea>(WORLD_AREAS_TABLE_NAME).filter(
    ({ areaType, sceneID }) => sceneID === OPEN_WORLD_SCENE_ID && areaType === WorldAreaType.Level2,
  );
  const levelTwoRowMap = new Map(levelTwoRows.map((row) => [row.areaID2, row]));
  const { level1Areas } = parseMachineJson<WorldAreaPolygonFile>(polygonsJson);
  const labels: MapLabel[] = level1Areas.flatMap(({ level2Areas = [] }) =>
    level2Areas.flatMap(({ id2, polygonData }) => {
      const row = levelTwoRowMap.get(id2);
      const outline = toCatalogueOutline(polygonData, origin);
      return row && outline.length > 0 ? [toMapLabel(row, outline)] : [];
    }),
  );
  return {
    notes: [`${labels.length} of ${levelTwoRows.length} open-world subareas take a label at their outline's mean`],
    objects: { [MAP_LABELS_KEY]: labels },
  };
};
