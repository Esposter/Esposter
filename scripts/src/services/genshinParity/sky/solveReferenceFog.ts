import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { FogSample } from "#src/models/genshinParity/sky/FogSample";
import type { SceneFog } from "#src/models/genshinParity/sky/SceneFog";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { getPixelSceneColor } from "#src/services/genshinParity/sky/getPixelSceneColor";
import { solveFogColors } from "#src/services/genshinParity/sky/solveFogColors";
import { toDisplayHex } from "#src/services/genshinParity/sky/toDisplayHex";
import { getOrCreate, withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";
import { Matrix4, Vector3 } from "three";

// The densities the refinement brackets, and how many golden-section steps narrow it, each a fixed share of the last
const DENSITY_RANGE: [number, number] = [0.0001, 3];
const GOLDEN_STEPS = 40;
const GOLDEN_SHARE = (Math.sqrt(5) - 1) / 2;
// The pixels are binned by their depth, in metres between one and the next, and by how far they look toward the sun, in
// Shares of its scatter weight, each bin read by its medians, so a frame whose texels do not line up with ours prices
// The fog's mix by distance and angle rather than rewarding a fog that washes every texel to the mean
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640, 1280];
const SCATTER_BIN_COUNT = 4;
const MIN_BIN_COUNT = 100;
const computeMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
const readPage = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
// A reference's haze solved over the parts the witness draws: each part's interior pixel past the fog's start, its
// Reference colour and ours drawn without the fog both taken back through the tone mapping into the scene's own colour
// (`toSceneColor`), so the fog's mix is linear in them. For a density, each pixel's opacity follows from its depth,
// Its height and the eye's (`computeFogOpacity`), and the fog's own and sunward colours are then a linear solve over the
// Pixels binned by depth and by angle to the sun, each bin's medians weighted by its pixels (`solveFogColors`); the
// Density is refined from the bracket by golden section on that solve's residual. The sunward weight is read toward
// The fog's own direction, solved at its current density and at the refined one, and toward the sky's sun at the
// Refined one, so the two directions are told apart by their residuals
export const solveReferenceFog = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  count: number;
  solutions: { color: string; density: number; direction: string; residual: number; scatterColor: string }[];
}> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const {
        targets: { depth = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Depth, WitnessTargetName.Part]);
      const sky = await readPage<{ matrixWorld: number[]; projectionMatrixInverse: number[]; sunDirection: Vector }>(
        page,
        "getSceneSky",
      );
      const fog = await readPage<SceneFog>(page, "getSceneFog");
      await setPageWitnessView(page, { isAlone: true });
      const litShot = await sharp(await page.screenshot())
        .resize(width, height, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer();
      const referenceShot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const matrixWorld = new Matrix4().fromArray(sky.matrixWorld);
      const projectionMatrixInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const eye = new Vector3().setFromMatrixPosition(matrixWorld).toArray();
      const points: FogSample[] = [];
      for (let pixel = 0; pixel < width * height; pixel++) {
        const pixelDepth = depth[pixel * 4] ?? 0;
        if (
          pixelDepth <= fog.startDistance ||
          !checkIsPartInterior(part, width, height, pixel) ||
          !checkIsScored(pixel, width)
        )
          continue;
        // The pixel's ray in the view, scaled to the depth along the view the witness wrote
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        const view = new Vector3(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5).applyMatrix4(
          projectionMatrixInverse,
        );
        const point = view
          .multiplyScalar(pixelDepth / -view.z)
          .applyMatrix4(matrixWorld)
          .toArray();
        points.push({
          lit: getPixelSceneColor(litShot, pixel),
          point,
          reference: getPixelSceneColor(referenceShot, pixel),
        });
      }
      // Each direction's bins: their pixels, the medians of their lit and reference colours and their mean scatter
      const computeBins = (direction: Vector) => {
        const binMap = new Map<number, { points: FogSample[]; scatters: number[] }>();
        for (const entry of points) {
          const ray = new Vector3(...entry.point).sub(new Vector3(...eye));
          const band = DEPTH_BANDS.findIndex((far) => ray.length() < far);
          const scatter = Math.min(
            Math.max(ray.normalize().dot(new Vector3(...direction)), 0) ** fog.scatterPower * fog.scatterStrength,
            1,
          );
          const key =
            band * SCATTER_BIN_COUNT + Math.min(Math.floor(scatter * SCATTER_BIN_COUNT), SCATTER_BIN_COUNT - 1);
          const bin = getOrCreate(binMap, key, () => ({ points: [], scatters: [] }));
          bin.points.push(entry);
          bin.scatters.push(scatter);
        }
        return [...binMap.values()].flatMap(({ points: binPoints, scatters }) =>
          binPoints.length < MIN_BIN_COUNT
            ? []
            : [
                {
                  lit: CHANNELS.map((channel) => computeMedian(binPoints.map(({ lit }) => lit[channel]))) as Vector,
                  points: binPoints.map(({ point }) => point),
                  reference: CHANNELS.map((channel) =>
                    computeMedian(binPoints.map(({ reference: color }) => color[channel])),
                  ) as Vector,
                  scatter: scatters.reduce((sum, value) => sum + value, 0) / scatters.length,
                },
              ],
        );
      };
      const solve = (density: number, bins: ReturnType<typeof computeBins>): ReturnType<typeof solveFogColors> =>
        solveFogColors(
          bins.map(({ lit, points: binPoints, reference, scatter }) => ({
            lit,
            opacity:
              binPoints.reduce((sum, point) => sum + computeFogOpacity(eye, point, { ...fog, density }), 0) /
              binPoints.length,
            reference,
            scatter,
            weight: binPoints.length,
          })),
        );
      const refine = (
        bins: ReturnType<typeof computeBins>,
      ): ReturnType<typeof solveFogColors> & { density: number } => {
        let [low, high] = DENSITY_RANGE.map((density) => Math.log(density)) as [number, number];
        for (let step = 0; step < GOLDEN_STEPS; step++) {
          const first = high - GOLDEN_SHARE * (high - low);
          const second = low + GOLDEN_SHARE * (high - low);
          if (solve(Math.exp(first), bins).residual < solve(Math.exp(second), bins).residual) high = second;
          else low = first;
        }
        const density = Math.exp((low + high) / 2);
        return { density, ...solve(density, bins) };
      };
      const directions: [string, Vector, number?][] = [
        ["the fog's own, at its density", fog.scatterDirection, fog.density],
        ["the fog's own", fog.scatterDirection],
        ["the sky's sun", sky.sunDirection],
      ];
      return {
        count: points.length,
        solutions: directions.map(([name, direction, fixedDensity]) => {
          const bins = computeBins(direction);
          const solved =
            fixedDensity === undefined ? refine(bins) : { density: fixedDensity, ...solve(fixedDensity, bins) };
          return {
            color: toDisplayHex(solved.color),
            density: solved.density,
            direction: name,
            residual: solved.residual,
            scatterColor: toDisplayHex(solved.scatterColor),
          };
        }),
      };
    },
    () => browser.close(),
  );
};
