import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsInsideRegionOutlines } from "#src/services/genshinAssets/fit/checkIsInsideRegionOutlines";
import { computeGroundBounds } from "#src/services/genshinAssets/fit/computeGroundBounds";
import { fitGaussianHills } from "#src/services/genshinAssets/fit/fitGaussianHills";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// How far round the centre the ground is fitted, every sample how far apart, and the distance a sample there weighs
// Half of one at the centre, in metres: the valley the screen's views see, its near ground first
const GROUND_RADIUS = 1000;
const GROUND_STEP = 6;
const GROUND_FALLOFF = 200;
// The hills' widths, widest first, down to the knolls round the oak and the statue
const GROUND_WIDTHS = [200, 120, 70, 40, 24, 14];
// The distances round the centre the fit's error is reported within
const GROUND_ERROR_BANDS = [60, 150, 300, 700];

// The catalogue's regions, each with its areas' outlines, which a region's ground is fitted inside
interface Catalogue {
  regions: { areas: { outline: GroundPoint[] }[]; id: string }[];
}

// A region's ground as our Gaussian hills over its terrain tiles' heightfields, in the world's axes round the oak's foot,
// Which every region shares: Three's, x as the game's and z its mirror, every height over the foot's. Fitted round the
// Region's centre and only inside its catalogue outlines, so no region's ground runs into another's; a region the
// Catalogue gives no outline (Windrise, the valley its views see) is fitted over its disc. Writes the hills, with the
// Heights they stand between, as `<region>/base-ground.json`, and returns the report and that path
export const fitRegionGround = async (region: DerivedAssetComponent, centre: GroundPoint): Promise<string[]> => {
  const [getGameHeight, [originX, originY, originZ], catalogueJson] = await Promise.all([
    readWorldTerrainHeight(region),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFile(join(WORLD_DATA_DIRECTORY, "catalogue.json"), "utf8"),
  ]);
  const { regions } = parseMachineJson<Catalogue>(catalogueJson);
  const outlines = (regions.find(({ id }) => id === region)?.areas ?? []).flatMap(({ outline }) =>
    outline.length > 0 ? [outline] : [],
  );
  const getHeight = (x: number, z: number): number =>
    checkIsInsideRegionOutlines(outlines, x, z) ? getGameHeight(originX + x, originZ - z) - originY : Number.NaN;
  const { errors, hills } = fitGaussianHills({
    bands: GROUND_ERROR_BANDS,
    center: [centre.x, centre.z],
    falloff: GROUND_FALLOFF,
    getHeight,
    radius: GROUND_RADIUS,
    step: GROUND_STEP,
    widths: GROUND_WIDTHS,
  });
  const heights: number[] = [];
  for (let x = centre.x - GROUND_RADIUS; x <= centre.x + GROUND_RADIUS; x += GROUND_STEP)
    for (let z = centre.z - GROUND_RADIUS; z <= centre.z + GROUND_RADIUS; z += GROUND_STEP)
      heights.push(getHeight(x, z));
  const path = await writeWorldData(join(region, "base-ground.json"), { ...hills, ...computeGroundBounds(heights) });
  return [
    `ground: ${hills.hills.length} hills, ${errors.map(({ rms, within }) => `${rms} metres within ${within}`).join(", ")}`,
    path,
  ];
};
