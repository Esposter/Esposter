import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsInsideRegionOutlines } from "#src/services/genshinAssets/fit/checkIsInsideRegionOutlines";
import { computeGroundBounds } from "#src/services/genshinAssets/fit/computeGroundBounds";
import { computeLagDifference } from "#src/services/genshinAssets/fit/computeLagDifference";
import { computeRootMeanSquare } from "#src/services/genshinAssets/fit/computeRootMeanSquare";
import { fitGaussianHills } from "#src/services/genshinAssets/fit/fitGaussianHills";
import { fitTerrainPlateaus } from "#src/services/genshinAssets/fit/fitTerrainPlateaus";
import { fitTerrainResidual } from "#src/services/genshinAssets/fit/fitTerrainResidual";
import { fitTerrainResidualFade } from "#src/services/genshinAssets/fit/fitTerrainResidualFade";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeMean } from "#src/services/genshinAssets/shared/computeMean";
import { GROUND_RADIUS, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { createGaussianHillsHeight, createTerrainShapeHeight, sampleTerrainResidualFade } from "genshin-engine";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every sample how far apart, and the distance a sample there weighs half of one at the centre, in metres: the valley
// The screen's views see, its near ground first
const GROUND_STEP = 6;
const GROUND_FALLOFF = 200;
// The hills' widths, widest first, down to the knolls round the oak and the statue
const GROUND_WIDTHS = [200, 120, 70, 40, 24, 14];
// The distance round the centre the ground's bar is read within, in metres, where the residual draws none
const GROUND_BAR_RADIUS = 60;
// The distances round the centre the fit's error is reported within
const GROUND_ERROR_BANDS = [GROUND_BAR_RADIUS, 150, 300, 700];
// The side of the residual's fade cells, in metres: the residual is drawn by how far the ground above it misses in each,
// And faded in over one past the bar's radius
const GROUND_FADE_CELL_SIZE = 64;
// The hills' bar within the bar's radius, in metres: a fade cell whose ground misses by less draws none of the residual,
// And one missing by twice it draws all
const GROUND_RESIDUAL_GATE_METRES = 0.62;

// The catalogue's regions, each with its areas' outlines, which a region's ground is fitted inside
interface Catalogue {
  regions: { areas: { outline: GroundPoint[] }[]; id: string }[];
}

// A region's ground as our Gaussian hills over its terrain tiles' heightfields, in the world's axes round the oak's foot,
// Which every region shares: Three's, x as the game's and z its mirror, every height over the foot's. Fitted round the
// Region's centre and only inside its catalogue outlines, so no region's ground runs into another's; a region the
// Catalogue gives no outline (Windrise, the valley its views see) is fitted over its disc. Writes the hills, the
// Plateaus the hills leave, the residual's noise faded out where they hold and the heights they stand between, as
// `<region>/base-ground.json`. Returns that path after the report, which holds the composed ground's error with and
// Without the residual
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
  const size = Math.floor((2 * GROUND_RADIUS) / GROUND_STEP) + 1;
  const heightGrid = mapTerrainResidualGrid(
    {
      originX: centre.x - GROUND_RADIUS,
      originZ: centre.z - GROUND_RADIUS,
      size,
      step: GROUND_STEP,
      values: new Float64Array(size * size),
    },
    getHeight,
  );
  const computeMisses = (getGroundHeight: (x: number, z: number) => number): TerrainResidualGrid =>
    mapTerrainResidualGrid(heightGrid, (x, z, height) => height - getGroundHeight(x, z));
  const { features, remainder } = fitTerrainPlateaus(computeMisses(createGaussianHillsHeight(hills)));
  const fade = {
    ...fitTerrainResidualFade(remainder, GROUND_FADE_CELL_SIZE, GROUND_RESIDUAL_GATE_METRES),
    clearing: { falloff: GROUND_FADE_CELL_SIZE, radius: GROUND_BAR_RADIUS, x: centre.x, z: centre.z },
  };
  const getFadeWeight = (x: number, z: number): number => sampleTerrainResidualFade(fade, x, z);
  const residual = { ...fitTerrainResidual(remainder, getFadeWeight), fade };
  const path = await writeWorldData(join(region, "base-ground.json"), {
    ...hills,
    features,
    ...computeGroundBounds(heightGrid.values),
    residual,
  });
  const getGroundHeight = createTerrainShapeHeight({ ...hills, features, residual });
  const getFeaturedHeight = createTerrainShapeHeight({ ...hills, features });
  const groundMisses = computeMisses(getGroundHeight);
  const unfadedMisses = computeMisses(getFeaturedHeight);
  const drawnResidual = mapTerrainResidualGrid(heightGrid, (x, z, height) =>
    Number.isFinite(height) ? getGroundHeight(x, z) - getFeaturedHeight(x, z) : Number.NaN,
  );
  const fadedRemainder = mapTerrainResidualGrid(remainder, (x, z, value) => getFadeWeight(x, z) * value);
  const octaveScales = Array.from({ length: residual.octaves }, (_value, octave) => residual.scale / 2 ** octave);
  const fadeWeights = mapTerrainResidualGrid(heightGrid, (x, z, height) =>
    Number.isFinite(height) ? getFadeWeight(x, z) : Number.NaN,
  );
  const getBandsReport = (
    grid: TerrainResidualGrid,
    compute: (values: readonly number[]) => number,
    unit: string,
  ): string =>
    GROUND_ERROR_BANDS.map((within) => {
      const values = mapTerrainResidualGrid(grid, (x, z, value) =>
        Math.hypot(x - centre.x, z - centre.z) < within ? value : Number.NaN,
      ).values.filter(Number.isFinite);
      return `${roundFitted(compute([...values]))}${unit} within ${within}`;
    }).join(", ");
  const getShareReport = (checkIsCounted: (weight: number) => boolean): string =>
    `${roundFitted((100 * fade.weights.filter(checkIsCounted).length) / fade.weights.length)}%`;
  return [
    `ground: ${hills.hills.length} hills, ${errors.map(({ rms, within }) => `${rms} metres within ${within}`).join(", ")}`,
    `ground: ${features.length} plateaus, a residual of ${residual.amplitude} metres at a ${residual.scale} metre scale`,
    `ground: the residual's fade over ${fade.weights.length} cells of ${GROUND_FADE_CELL_SIZE} metres, ${getShareReport((weight) => weight === 0)} at none, ${getShareReport((weight) => weight > 0 && weight < 1)} between and ${getShareReport((weight) => weight === 1)} at one, its mean weight ${getBandsReport(fadeWeights, computeMean, "")}`,
    `ground: composed ${getBandsReport(groundMisses, computeRootMeanSquare, " metres")}, ${roundFitted(computeRootMeanSquare(groundMisses.values))} over the fitted extent and ${roundFitted(computeRootMeanSquare(unfadedMisses.values))} without its residual`,
    `ground: the residual's power by octave against the faded leftover's, as the change over its scale, ${octaveScales.map((scale) => `${roundFitted(computeLagDifference(drawnResidual, scale))} against ${roundFitted(computeLagDifference(fadedRemainder, scale))} metres at ${scale}`).join(", ")}`,
    path,
  ];
};
