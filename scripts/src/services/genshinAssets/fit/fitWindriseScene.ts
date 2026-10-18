import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitAreaOutlines } from "#src/services/genshinAssets/fit/fitAreaOutlines";
import { fitGroundLayerColours } from "#src/services/genshinAssets/fit/fitGroundLayerColours";
import { fitGroundLayerField } from "#src/services/genshinAssets/fit/fitGroundLayerField";
import { fitRegionCapitals } from "#src/services/genshinAssets/fit/fitRegionCapitals";
import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { fitSurfaceColours } from "#src/services/genshinAssets/fit/fitSurfaceColours";
import { fitWindriseOak } from "#src/services/genshinAssets/fit/fitWindriseOak";
import { fitWindrisePaving } from "#src/services/genshinAssets/fit/fitWindrisePaving";
import { fitWindrisePlants } from "#src/services/genshinAssets/fit/fitWindrisePlants";
import { fitWindriseStatue } from "#src/services/genshinAssets/fit/fitWindriseStatue";
import { readGroundLayerCells } from "#src/services/genshinAssets/fit/readGroundLayerCells";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import {
  GROUND_LAYER_CELL_SIZE,
  GROUND_RADIUS,
  WINDRISE_REGION_FILE,
} from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";
import { GameDataset, WindrisePartFamily, WindrisePartFamilyMeshRegexMap, windriseSurfacesSchema } from "genshin-world";

// Windrise's parts fitted as our own generators' parameters, each a record under `windrise/`: its ground as hills, its
// Oak's canopy as clusters and its trunk's taper read off the export, its statue as stacks fitted piece by piece to its
// Meshes, its families' surface colours and each part's as the export's textures paint them, and its water's level over
// The oak's foot, the last three exact, and its ground's layers as a field of their shares over its tiles' cells. Its
// Landmarks' places and turns are written into Mondstadt's region data, every region's capital is placed with them and
// Every area of the catalogue outlined, round the same origin, since the oak's foot is the whole world's
export const fitWindriseScene = (only: readonly string[] = []): Promise<GameDataBuild> =>
  runFits(
    {
      // Every area's outline in the catalogue is drawn round the oak's foot too, as the capitals are placed
      catalogue: fitAreaOutlines,
      ground: () =>
        fitGroundPieces(
          DerivedAssetComponent.Windrise,
          {
            centre: { x: 0, z: 0 },
            half: GROUND_RADIUS,
            isInside: (x, z) => Math.hypot(x, z) <= GROUND_RADIUS,
            key: `${GameDataset.Ground}/${DerivedAssetComponent.Windrise}`,
          },
          false,
        ),
      // Mondstadt's capital is in the file Windrise's landmarks are, so the two are written one after the other
      landmarks: async () => {
        const landmarksPath = await fitRegionLandmarks(DerivedAssetComponent.Windrise, WINDRISE_REGION_FILE);
        const { notes, objects } = await fitRegionCapitals();
        return { notes: [landmarksPath, ...notes], objects };
      },
      oak: fitWindriseOak,
      paving: async () => ({ notes: [], objects: { "windrise/paving": await fitWindrisePaving() } }),
      plants: async () => ({ notes: [], objects: { "windrise/plants": await fitWindrisePlants() } }),
      statue: fitWindriseStatue,
      // The surfaces record holds the families its reader parses: the grass has no mesh in the exports to read. The
      // Ground's family also holds each of its layers' colours, which the tiles' own cells class
      surfaces: async () => {
        const [tiles, origin] = await Promise.all([
          readGroundLayerCells(DerivedAssetComponent.Windrise),
          readWorldOrigin(DerivedAssetComponent.Windrise),
        ]);
        const groundLayers = fitGroundLayerField(tiles, origin, GROUND_RADIUS, GROUND_LAYER_CELL_SIZE);
        const [groundLayerColours, surfaces] = await Promise.all([
          fitGroundLayerColours(DerivedAssetComponent.Windrise, tiles, origin, GROUND_RADIUS),
          fitSurfaceColours(
            DerivedAssetComponent.Windrise,
            Object.fromEntries(
              windriseSurfacesSchema.keyof().options.map((family) => [family, WindrisePartFamilyMeshRegexMap[family]]),
            ),
            GROUND_RADIUS,
          ),
        ]);
        const layerColours: Record<string, string | undefined> = groundLayerColours;
        const layerShares = Object.entries(groundLayers.layers).map(
          ([layer, shares]) =>
            `${layer} ${roundFitted((100 * shares.reduce((sum, share) => sum + share, 0)) / shares.length)}% ${layerColours[layer] ?? "unseen"}`,
        );
        // The metres a texel of each family's detail spans, as its faces draw its textures
        const detailTexels = Object.entries(surfaces).map(
          ([family, { detail }]) => `${family} ${detail ? `${detail.metresPerTexel.toPrecision(2)} m` : "none"}`,
        );
        return {
          notes: [
            `ground layers: ${layerShares.join(", ")} of the field's nodes, each with its colour`,
            `surface detail a texel: ${detailTexels.join(", ")}`,
          ],
          objects: {
            "windrise/ground-layers": groundLayers,
            "windrise/surfaces": {
              ...surfaces,
              [WindrisePartFamily.Ground]: { ...surfaces[WindrisePartFamily.Ground], layers: groundLayerColours },
            },
          },
        };
      },
      water: async () => {
        const [[, originY], waterLevel] = await Promise.all([
          readWorldOrigin(DerivedAssetComponent.Windrise),
          readWorldWaterLevel(DerivedAssetComponent.Windrise),
        ]);
        return { notes: [], objects: { "windrise/water": { level: roundFitted(waterLevel - originY) } } };
      },
    },
    only,
  );
