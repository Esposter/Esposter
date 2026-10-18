import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
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
import { GROUND_GATE_SAMPLES } from "#src/services/genshinAssets/shared/constants";
import { computeExtentGap } from "#src/services/genshinAssets/world/computeExtentGap";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { toPointExtent } from "#src/services/genshinAssets/world/toPointExtent";
import { computeMean } from "#src/services/recreation/statistics/computeMean";
import { computeRootMeanSquare } from "#src/services/recreation/statistics/computeRootMeanSquare";
import { createGaussianHillsHeight, createTerrainShapeHeight, sampleTerrainResidualFade } from "genshin-engine";
import { regionGroundSchema } from "genshin-world";

// The samples of a grid the bar and the gate are read on: every one the piece holds outside its cities
const selectBarSamples = (grid: TerrainResidualGrid): Float64Array => grid.values.filter(Number.isFinite);

// The distance between a piece's samples, and the distance from its centre a sample weighs half of one at the centre, in
// Metres
const GROUND_STEP = 6;
const GROUND_FALLOFF = 200;
// The hills' widths, widest first, down to the knolls round the oak and the statue
const GROUND_WIDTHS = [200, 120, 70, 40, 24, 14];
// The distance from a place a city is looked for at, in metres, and the distance from it its footprint is read within
const GROUND_BAR_RADIUS = 60;
// The distances round the piece's centre its fit's error is reported within
const GROUND_ERROR_BANDS = [GROUND_BAR_RADIUS, 150, 300, 700];
// The side of the residual's fade cells, in metres: the residual is drawn by how far the ground above it misses in each
// Against the piece's gate, and faded in over one past the bar's radius
const GROUND_FADE_CELL_SIZE = 64;

// A piece of a region's ground as our Gaussian hills over its terrain tiles' heightfields, in the world's axes round the
// Oak's foot, which every region shares: Three's, x as the game's and z its mirror, every height over the foot's. Fitted
// Over the samples of its square inside `isInside`, so no piece runs
// Into another's outline. The piece's own ground is its gate's and its bar's: the gate is the RMS of its detail finer
// Than the fit's step over the samples the bar is read on, the roughness no hill of the fit's widths follows, and the
// Bar is the RMS of its hills and features, without the residual, over the same samples. A capital's city is no piece's
// Own ground: inside it the fit takes the land the city stands on, its tiles smoothed at the narrowest hills' width, and
// Its buildings and plazas own the tiers and walls over it. Returns the piece's hills, the plateaus, cliffs and ridges
// The hills leave, the residual's noise faded out where they hold against the gate and the heights they stand between,
// As the record of the piece under its key, with a report holding the gate, the bar against it and the composed ground's
// Error with and without the residual, and a piece whose bar misses its gate, or reads on too few samples, is refused: it
// Returns no record, and its report names it
export const fitGroundPiece = async (region: DerivedAssetComponent, piece: GroundPiece): Promise<GroundPieceFit> => {
  const [getGameHeight, origin] = await Promise.all([
    readWorldTerrainHeight(region),
    readWorldOrigin(DerivedAssetComponent.Windrise),
  ]);
  const [originX, originY, originZ] = origin;
  const { centre, half, isInside, key } = piece;
  const getCentreDistance = (x: number, z: number): number => Math.hypot(x - centre.x, z - centre.z);
  const { cityAreas, footprints } = await readGroundFootprints(centre, half, GROUND_BAR_RADIUS, origin);
  // How far a place stands from the nearest of the cities' areas, none inside one
  const getCityDistance = (x: number, z: number): number => {
    const place = toCapitalWorldPlace({ x, z }, origin);
    const placeExtent = toPointExtent(place);
    return Math.min(...cityAreas.map(({ extent }) => computeExtentGap(extent, placeExtent)));
  };
  const size = Math.floor((2 * half) / GROUND_STEP) + 1;
  const tileGrid = mapTerrainResidualGrid(
    {
      originX: centre.x - half,
      originZ: centre.z - half,
      size,
      step: GROUND_STEP,
      values: new Float64Array(size * size),
    },
    (x, z) => (isInside(x, z) ? getGameHeight(originX + x, originZ - z) - originY : Number.NaN),
  );
  const cityDistances = mapTerrainResidualGrid(tileGrid, getCityDistance).values;
  // The piece's own ground, NaN inside a city, and the land a city stands on: its tiles smoothed at the narrowest hills'
  // Width, which holds none of its tiers and walls
  const naturalGrid = {
    ...tileGrid,
    values: tileGrid.values.map((height, index) => (cityDistances[index] === 0 ? Number.NaN : height)),
  };
  // A piece whose gate reads on fewer samples than the gate needs, or on none, is refused before its hills are fitted
  const sampleCount = selectBarSamples(naturalGrid).length;
  if (sampleCount < GROUND_GATE_SAMPLES)
    return {
      build: {
        notes: [
          sampleCount === 0
            ? `${key}: refused, no terrain under its ground`
            : `${key}: refused, ${sampleCount} samples under its ground against the ${GROUND_GATE_SAMPLES} its gate needs`,
        ],
        objects: {},
      },
      isHeld: false,
      sampleCount,
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
    radius: half,
    step: GROUND_STEP,
    widths: GROUND_WIDTHS,
  });
  // What a ground misses by over the samples the fit takes, and over the piece's own ground the bar is read on
  const computeMisses = (getGroundHeight: (x: number, z: number) => number): TerrainResidualGrid =>
    mapTerrainResidualGrid(heightGrid, (x, z, height) => height - getGroundHeight(x, z));
  const computeNaturalMisses = (getGroundHeight: (x: number, z: number) => number): TerrainResidualGrid =>
    mapTerrainResidualGrid(naturalGrid, (x, z, height) => height - getGroundHeight(x, z));
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
    clearings: footprints.map(({ radius, x, z }) => ({ falloff: GROUND_FADE_CELL_SIZE, radius, x, z })),
  };
  const getFadeWeight = (x: number, z: number): number => sampleTerrainResidualFade(fade, x, z);
  const residual = { ...fitTerrainResidual(remainder, getFadeWeight), fade };
  const getGroundHeight = createTerrainShapeHeight({ ...hills, features, residual });
  const getFeaturedHeight = createTerrainShapeHeight({ ...hills, features });
  const groundMisses = computeNaturalMisses(getGroundHeight);
  // The composed ground against the tiles inside the cities, their tiers and walls among them
  const cityMisses = mapTerrainResidualGrid(tileGrid, (x, z, height) =>
    getCityDistance(x, z) === 0 ? getGroundHeight(x, z) - height : Number.NaN,
  ).values.filter(Number.isFinite);
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
  const isHeld = bar <= gate;
  const getBandsReport = (
    grid: TerrainResidualGrid,
    compute: (values: readonly number[]) => number,
    unit: string,
  ): string =>
    GROUND_ERROR_BANDS.map((within) => {
      const values = mapTerrainResidualGrid(grid, (x, z, value) =>
        getCentreDistance(x, z) < within ? value : Number.NaN,
      ).values.filter(Number.isFinite);
      return `${roundFitted(compute([...values]))}${unit} within ${within}`;
    }).join(", ");
  const ground = { ...hills, features, ...computeGroundBounds(heightGrid.values), residual };
  // The reader parses the ground against its schema, which refuses a value JSON cannot hold, such as a NaN written out as
  // Null, so a ground the reader would refuse throws here, before anything is published
  regionGroundSchema.parse(ground);
  const getShareReport = (checkIsCounted: (weight: number) => boolean): string =>
    `${roundFitted((100 * fade.weights.filter(checkIsCounted).length) / fade.weights.length)}%`;
  return {
    build: {
      notes: [
        cityMisses.length === 0
          ? `${key}: no city area inside its ground`
          : `${key}: the city areas fitted as the land they stand on, ${cityAreas.map(({ code }) => code).join(", ")}; inside them the composed ground stands ${roundFitted(computeMean([...cityMisses]))} metres over the tiles on the mean, ${roundFitted(computeRootMeanSquare([...cityMisses]))} RMS`,
        `${key}: a gate of ${gate} metres, the RMS of its own detail finer than ${GROUND_STEP} metres over ${detailSamples.length} samples`,
        `${key}: the bar, its hills and features ${bar} metres over its own ground against the gate's ${gate}, ${isHeld ? "held" : "missed, refused"}`,
        `${key}: ${hills.hills.length} hills, ${getBandsReport(computeNaturalMisses(getHillsHeight), computeRootMeanSquare, " metres")} from its centre`,
        `${key}: ${plateaus.features.length} plateaus, ${cliffs.features.length} cliffs and ${ridges.length} ridges, a residual of ${residual.amplitude} metres at a ${residual.scale} metre scale`,
        `${key}: the residual's fade over ${fade.weights.length} cells of ${GROUND_FADE_CELL_SIZE} metres, ${getShareReport((weight) => weight === 0)} at none, ${getShareReport((weight) => weight > 0 && weight < 1)} between and ${getShareReport((weight) => weight === 1)} at one, its mean weight ${getBandsReport(fadeWeights, computeMean, "")}`,
        `${key}: composed ${getBandsReport(groundMisses, computeRootMeanSquare, " metres")}, ${roundFitted(computeRootMeanSquare(groundMisses.values))} over its samples and ${roundFitted(computeRootMeanSquare(unfadedMisses.values))} without its residual`,
        `${key}: places cleared of the residual, ${footprints
          .map(({ id: placeId, radius, source, x, z }) => {
            const tileHeight = getGameHeight(originX + x, originZ - z) - originY;
            // A place on another region's tiles, as Windrise's oak is inside Mondstadt's extent, has no tile here to stand over
            const overTiles = Number.isFinite(tileHeight)
              ? ` and its ground ${roundFitted(getGroundHeight(x, z) - tileHeight)} metres over the tiles'`
              : "";
            return `${placeId} ${radius} metres from ${source}, its residual ${roundFitted(getGroundHeight(x, z) - getFeaturedHeight(x, z))} metres${overTiles}`;
          })
          .join(", ")}`,
        `${key}: the residual's power by octave against the faded leftover's, as the change over its scale, ${octaveScales.map((scale) => `${roundFitted(computeLagDifference(drawnResidual, scale))} against ${roundFitted(computeLagDifference(fadedRemainder, scale))} metres at ${scale}`).join(", ")}`,
      ],
      objects: isHeld ? { [key]: ground } : {},
    },
    isHeld,
    sampleCount,
  };
};
