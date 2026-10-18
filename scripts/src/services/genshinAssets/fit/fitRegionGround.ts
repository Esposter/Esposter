import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsInsideRegionOutlines } from "#src/services/genshinAssets/fit/checkIsInsideRegionOutlines";
import { computeGroundBounds } from "#src/services/genshinAssets/fit/computeGroundBounds";
import { computeLagDifference } from "#src/services/genshinAssets/fit/computeLagDifference";
import { computeTerrainDetail } from "#src/services/genshinAssets/fit/computeTerrainDetail";
import { fitGaussianHills } from "#src/services/genshinAssets/fit/fitGaussianHills";
import { fitTerrainCliffs } from "#src/services/genshinAssets/fit/fitTerrainCliffs";
import { fitTerrainPlateaus } from "#src/services/genshinAssets/fit/fitTerrainPlateaus";
import { fitTerrainResidual } from "#src/services/genshinAssets/fit/fitTerrainResidual";
import { fitTerrainResidualFade } from "#src/services/genshinAssets/fit/fitTerrainResidualFade";
import { fitTerrainRidges } from "#src/services/genshinAssets/fit/fitTerrainRidges";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { readGroundFootprints } from "#src/services/genshinAssets/fit/readGroundFootprints";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { smoothTerrainGrid } from "#src/services/genshinAssets/fit/smoothTerrainGrid";
import { CATALOGUE_PATH, GROUND_RADIUS } from "#src/services/genshinAssets/shared/constants";
import { computeExtentGap } from "#src/services/genshinAssets/world/computeExtentGap";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { toPointExtent } from "#src/services/genshinAssets/world/toPointExtent";
import { computeMean } from "#src/services/recreation/statistics/computeMean";
import { computeRootMeanSquare } from "#src/services/recreation/statistics/computeRootMeanSquare";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { createGaussianHillsHeight, createTerrainShapeHeight, sampleTerrainResidualFade } from "genshin-engine";
import { GameDataset, regionGroundSchema } from "genshin-world";
import { readFile } from "node:fs/promises";

// Every sample how far apart, and the distance a sample there weighs half of one at the centre, in metres: the valley
// The screen's views see, its near ground first
const GROUND_STEP = 6;
const GROUND_FALLOFF = 200;
// How far round its centre a region the catalogue outlines is fitted, in metres: its capital's surroundings, out to
// Twice the falloff the hills weigh their samples by, where one counts a fifth of one at the centre. The features carry
// No such weight and stop at a share of the whole extent's error, so past where the hills still weigh the ground they
// Would be spent on land the fit does not serve, leaving the city's ground unheld
const REGION_GROUND_RADIUS = 2 * GROUND_FALLOFF;
// The hills' widths, widest first, down to the knolls round the oak and the statue
const GROUND_WIDTHS = [200, 120, 70, 40, 24, 14];
// The distance the ground's bar is read within, in metres, round the centre or round the city it stands in, where the
// Residual draws none round the centre
const GROUND_BAR_RADIUS = 60;
// The distances round the bar's place the fit's error is reported within
const GROUND_ERROR_BANDS = [GROUND_BAR_RADIUS, 150, 300, 700];
// The side of the residual's fade cells, in metres: the residual is drawn by how far the ground above it misses in each
// Against the region's gate, and faded in over one past the bar's radius
const GROUND_FADE_CELL_SIZE = 64;

// The catalogue's regions, each with its areas' outlines, which a region's ground is fitted inside
interface Catalogue {
  regions: { areas: { outline: GroundPoint[] }[]; id: string }[];
}

// A region's ground as our Gaussian hills over its terrain tiles' heightfields, in the world's axes round the oak's
// Foot, which every region shares: Three's, x as the game's and z its mirror, every height over the foot's. Fitted
// Round the region's centre, within its radius and only inside its catalogue outlines, so no region's ground runs into
// Another's; a region the catalogue gives no outline (Windrise, the valley its views see) is fitted over its whole
// Disc. A capital's city is no region's own ground: its buildings and plazas own its tiers and walls (Mondstadt City's
// Are flat terraces with steps of metres between two of the tiles' samples), so inside it the fit takes the land the
// City stands on, its tiles smoothed at the narrowest hills' width, and its bar is read on the region's own ground
// Alone. Left unsampled, the hills would run on into a city unheld, tens of metres off its tiles. The region's gate is
// Read off the ground itself, never off the fit: the RMS of its detail finer than the fit's step over the samples its
// Bar is read on, the roughness no hill of the fit's widths follows (the narrowest keeps about a hundredth of its power
// Through it), against which the tiles' own rounding, a 1024 metre height scale in 16 bits (`parseTerrainHeights`), is
// Under a centimetre. Returns the hills, the plateaus, cliffs and ridges the hills leave, the residual's noise faded
// Out where they hold against the gate and the heights they stand between as the region's ground, the record
// `ground/<region>`, with a report holding the gate, the bar the hills and features are held to against it, and the
// Composed ground's error with and without the residual
export const fitRegionGround = async (region: DerivedAssetComponent, centre: GroundPoint): Promise<GameDataBuild> => {
  const [getGameHeight, origin, catalogueJson] = await Promise.all([
    readWorldTerrainHeight(region),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFile(CATALOGUE_PATH, "utf8"),
  ]);
  const [originX, originY, originZ] = origin;
  const { regions } = parseMachineJson<Catalogue>(catalogueJson);
  const outlines = (regions.find(({ id }) => id === region)?.areas ?? []).flatMap(({ outline }) =>
    outline.length > 0 ? [outline] : [],
  );
  const extentRadius = outlines.length > 0 ? REGION_GROUND_RADIUS : GROUND_RADIUS;
  const { cityAreas, footprints } = await readGroundFootprints(centre, GROUND_RADIUS, GROUND_BAR_RADIUS, origin);
  // How far a place stands from the nearest of the cities' areas, none inside one
  const getCityDistance = (x: number, z: number): number => {
    const place = toCapitalWorldPlace({ x, z }, origin);
    const placeExtent = toPointExtent(place);
    return Math.min(...cityAreas.map(({ extent }) => computeExtentGap(extent, placeExtent)));
  };
  // A centre standing in a city reads its bar on the ground round the city, the nearest a region's own ground comes
  const isCentreInCity = getCityDistance(centre.x, centre.z) === 0;
  const getBarDistance = (x: number, z: number): number =>
    isCentreInCity ? getCityDistance(x, z) : Math.hypot(x - centre.x, z - centre.z);
  const size = Math.floor((2 * GROUND_RADIUS) / GROUND_STEP) + 1;
  const tileGrid = mapTerrainResidualGrid(
    {
      originX: centre.x - GROUND_RADIUS,
      originZ: centre.z - GROUND_RADIUS,
      size,
      step: GROUND_STEP,
      values: new Float64Array(size * size),
    },
    (x, z) =>
      Math.hypot(x - centre.x, z - centre.z) <= extentRadius && checkIsInsideRegionOutlines(outlines, x, z)
        ? getGameHeight(originX + x, originZ - z) - originY
        : Number.NaN,
  );
  const cityDistances = mapTerrainResidualGrid(tileGrid, getCityDistance).values;
  // The region's own ground, NaN inside a city, and the land a city stands on: its tiles smoothed at the narrowest
  // Hills' width, which holds none of its tiers and walls
  const naturalGrid = {
    ...tileGrid,
    values: tileGrid.values.map((height, index) => (cityDistances[index] === 0 ? Number.NaN : height)),
  };
  const cityLand = smoothTerrainGrid(tileGrid, Math.min(...GROUND_WIDTHS)).values;
  const heightGrid = {
    ...tileGrid,
    values: tileGrid.values.map((height, index) =>
      cityDistances[index] === 0 && Number.isFinite(height) ? (cityLand[index] ?? Number.NaN) : height,
    ),
  };
  const { hills } = fitGaussianHills({
    bands: GROUND_ERROR_BANDS,
    center: [centre.x, centre.z],
    falloff: GROUND_FALLOFF,
    getHeight: (x, z) =>
      heightGrid.values[
        Math.round((z - heightGrid.originZ) / GROUND_STEP) * size + Math.round((x - heightGrid.originX) / GROUND_STEP)
      ] ?? Number.NaN,
    radius: GROUND_RADIUS,
    step: GROUND_STEP,
    widths: GROUND_WIDTHS,
  });
  // What a ground misses by over the samples the fit takes, and over the region's own ground the bar is read on
  const computeMisses = (getGroundHeight: (x: number, z: number) => number): TerrainResidualGrid =>
    mapTerrainResidualGrid(heightGrid, (x, z, height) => height - getGroundHeight(x, z));
  const computeNaturalMisses = (getGroundHeight: (x: number, z: number) => number): TerrainResidualGrid =>
    mapTerrainResidualGrid(naturalGrid, (x, z, height) => height - getGroundHeight(x, z));
  const selectBarSamples = (grid: TerrainResidualGrid): Float64Array =>
    mapTerrainResidualGrid(grid, (x, z, value) =>
      getBarDistance(x, z) < GROUND_BAR_RADIUS ? value : Number.NaN,
    ).values.filter((sample) => Number.isFinite(sample));
  const detailSamples = selectBarSamples(computeTerrainDetail(naturalGrid, GROUND_STEP));
  const gate = roundFitted(computeRootMeanSquare(detailSamples));
  const getHillsHeight = createGaussianHillsHeight(hills);
  const hillMisses = computeMisses(getHillsHeight);
  const plateaus = fitTerrainPlateaus(hillMisses);
  const cliffs = fitTerrainCliffs(plateaus.remainder);
  const { features: ridges, remainder } = fitTerrainRidges(cliffs.remainder);
  const features = [...plateaus.features, ...cliffs.features, ...ridges];
  const fade = {
    ...fitTerrainResidualFade(remainder, GROUND_FADE_CELL_SIZE, gate),
    clearings: [{ radius: GROUND_BAR_RADIUS, ...centre }, ...footprints].map(({ radius, x, z }) => ({
      falloff: GROUND_FADE_CELL_SIZE,
      radius,
      x,
      z,
    })),
  };
  const getFadeWeight = (x: number, z: number): number => sampleTerrainResidualFade(fade, x, z);
  const residual = { ...fitTerrainResidual(remainder, getFadeWeight), fade };
  const getGroundHeight = createTerrainShapeHeight({ ...hills, features, residual });
  const getFeaturedHeight = createTerrainShapeHeight({ ...hills, features });
  const groundMisses = computeNaturalMisses(getGroundHeight);
  // The composed ground against the tiles inside the cities, their tiers and walls among them
  const cityMisses = mapTerrainResidualGrid(tileGrid, (x, z, height) =>
    getCityDistance(x, z) === 0 ? getGroundHeight(x, z) - height : Number.NaN,
  ).values.filter((sample) => Number.isFinite(sample));
  const unfadedMisses = computeNaturalMisses(getFeaturedHeight);
  const drawnResidual = mapTerrainResidualGrid(heightGrid, (x, z, height) =>
    Number.isFinite(height) ? getGroundHeight(x, z) - getFeaturedHeight(x, z) : Number.NaN,
  );
  const fadedRemainder = mapTerrainResidualGrid(remainder, (x, z, value) => getFadeWeight(x, z) * value);
  const octaveScales = Array.from({ length: residual.octaves }, (_value, octave) => residual.scale / 2 ** octave);
  const fadeWeights = mapTerrainResidualGrid(heightGrid, (x, z, height) =>
    Number.isFinite(height) ? getFadeWeight(x, z) : Number.NaN,
  );
  const bar = roundFitted(computeRootMeanSquare(selectBarSamples(unfadedMisses)));
  const barPlace = isCentreInCity ? "the city" : "the centre";
  const getBandsReport = (
    grid: TerrainResidualGrid,
    compute: (values: readonly number[]) => number,
    unit: string,
  ): string =>
    GROUND_ERROR_BANDS.map((within) => {
      const values = mapTerrainResidualGrid(grid, (x, z, value) =>
        getBarDistance(x, z) < within ? value : Number.NaN,
      ).values.filter((sample) => Number.isFinite(sample));
      return `${roundFitted(compute([...values]))}${unit} within ${within}`;
    }).join(", ");
  const ground = { ...hills, features, ...computeGroundBounds(heightGrid.values), residual };
  // The reader parses the ground against its schema, which refuses a value JSON cannot hold, such as a NaN written out as
  // Null, so a ground the reader would refuse throws here, before anything is published
  regionGroundSchema.parse(ground);
  const getShareReport = (checkIsCounted: (weight: number) => boolean): string =>
    `${roundFitted((100 * fade.weights.filter((weight) => checkIsCounted(weight)).length) / fade.weights.length)}%`;
  return {
    notes: [
      cityMisses.length === 0
        ? "ground: no city area inside the fitted extent"
        : `ground: the city areas fitted as the land they stand on, ${cityAreas.map(({ code }) => code).join(", ")}, and the bar and the composed ground's bands read round ${barPlace}; inside them the composed ground stands ${roundFitted(computeMean([...cityMisses]))} metres over the tiles on the mean, ${roundFitted(computeRootMeanSquare([...cityMisses]))} RMS`,
      `ground: a gate of ${gate} metres, the RMS of the ground's own detail finer than ${GROUND_STEP} metres over the ${detailSamples.length} samples within ${GROUND_BAR_RADIUS} of ${barPlace}`,
      `ground: the bar, its hills and features ${bar} metres within ${GROUND_BAR_RADIUS} of ${barPlace} against the gate's ${gate}, ${bar <= gate ? "held" : "missed"}`,
      `ground: ${hills.hills.length} hills, ${getBandsReport(computeNaturalMisses(getHillsHeight), computeRootMeanSquare, " metres")}`,
      `ground: ${plateaus.features.length} plateaus, ${cliffs.features.length} cliffs and ${ridges.length} ridges, a residual of ${residual.amplitude} metres at a ${residual.scale} metre scale`,
      `ground: the residual's fade over ${fade.weights.length} cells of ${GROUND_FADE_CELL_SIZE} metres, ${getShareReport((weight) => weight === 0)} at none, ${getShareReport((weight) => weight > 0 && weight < 1)} between and ${getShareReport((weight) => weight === 1)} at one, its mean weight ${getBandsReport(fadeWeights, computeMean, "")}`,
      `ground: composed ${getBandsReport(groundMisses, computeRootMeanSquare, " metres")}, ${roundFitted(computeRootMeanSquare(groundMisses.values))} over the fitted extent and ${roundFitted(computeRootMeanSquare(unfadedMisses.values))} without its residual`,
      `ground: places cleared of the residual, ${footprints
        .map(({ id, radius, source, x, z }) => {
          const tileHeight = getGameHeight(originX + x, originZ - z) - originY;
          // A place on another region's tiles, as Windrise's oak is inside Mondstadt's extent, has no tile here to stand over
          const overTiles = Number.isFinite(tileHeight)
            ? ` and its ground ${roundFitted(getGroundHeight(x, z) - tileHeight)} metres over the tiles'`
            : "";
          return `${id} ${radius} metres from ${source}, its residual ${roundFitted(getGroundHeight(x, z) - getFeaturedHeight(x, z))} metres${overTiles}`;
        })
        .join(", ")}`,
      `ground: the residual's power by octave against the faded leftover's, as the change over its scale, ${octaveScales.map((scale) => `${roundFitted(computeLagDifference(drawnResidual, scale))} against ${roundFitted(computeLagDifference(fadedRemainder, scale))} metres at ${scale}`).join(", ")}`,
    ],
    objects: { [`${GameDataset.Ground}/${region}`]: ground },
  };
};
