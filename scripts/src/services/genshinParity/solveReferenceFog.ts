import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";
import { checkIsPartInterior } from "#src/services/genshinParity/checkIsPartInterior";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readFogOpacity } from "#src/services/genshinParity/readFogOpacity";
import { readWitnessTargets } from "#src/services/genshinParity/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { solveFogColors } from "#src/services/genshinParity/solveFogColors";
import { withFinalizerAsync } from "@esposter/shared";
import { toneMapNeutral, toSceneColor } from "genshin-engine";
import sharp from "sharp";
import { Color, Matrix4, Vector3 } from "three";

type Vector = [number, number, number];
const BYTE = 255;
const CHANNELS = [0, 1, 2] as const;
// The densities the refinement brackets, and how many golden-section steps narrow it, each a fixed share of the last
const DENSITY_RANGE: [number, number] = [0.0001, 3];
const GOLDEN_STEPS = 40;
const GOLDEN_SHARE = (Math.sqrt(5) - 1) / 2;
// The pixels are binned by their depth, in metres between one and the next, by how far they look toward the sun, in
// Shares of its scatter weight, and where the lights are solved by how their faces turn to the light, each bin read
// By its medians, so a frame whose texels do not line up with ours prices the fog's mix and the light by distance,
// Angle and facing rather than rewarding a fog that washes every texel to the mean
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640, 1280];
const SCATTER_BIN_COUNT = 4;
// A face's cosine to the light past which it is lit, and under the negative of which it is turned away
const FACING_COSINE = 0.3;
const MIN_BIN_COUNT = 100;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const toDisplayHex = ([red, green, blue]: Vector): string =>
  `#${new Color(...toneMapNeutral([Math.max(red, 0), Math.max(green, 0), Math.max(blue, 0)])).getHexString()}`;
const readMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
interface Point {
  facing: number;
  lights: Vector[];
  point: Vector;
  reference: Vector;
}
interface SceneFog {
  baseHeight: number;
  density: number;
  heightFalloff: number;
  scatterDirection: Vector;
  scatterPower: number;
  scatterStrength: number;
  startDistance: number;
}
const readPage = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
type SetLights = (shares: { ambientShare?: number; sunShare?: number }) => { direction: Vector };
const setLights = (page: Page, shares: { ambientShare?: number; sunShare?: number }): Promise<{ direction: Vector }> =>
  page.evaluate((lightShares) => (Reflect.get(window, "setSceneLights") as SetLights)(lightShares), shares);
// A reference's haze solved over the parts the witness draws: each part's interior pixel past the fog's start, its
// Reference colour and ours drawn without the fog both taken back through the tone mapping into the scene's own colour
// (`toSceneColor`), so the fog's mix is linear in them. For a density, each pixel's opacity follows from its depth,
// Its height and the eye's (`readFogOpacity`), and the fog's own and sunward colours are then a linear solve over the
// Pixels binned by depth and by angle to the sun, each bin's medians weighted by its pixels (`solveFogColors`); the
// Density is refined from the bracket by golden section on that solve's residual. With the lights solved, ours is
// Drawn under the sun alone and the sky light alone, the bins split by how their faces turn to the sun, and each
// Light's share of its strength per channel is solved with the fog's colours, so a light too dim is not mistaken for a
// Fog too thick. The sunward weight is read toward the fog's own direction, the shading light's, and toward the sky's
// Sun, each solved, so the two are told apart by their residuals; the fog's current density is solved beside them
export const solveReferenceFog = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  { isLightSolved = false }: { isLightSolved?: boolean } = {},
): Promise<{
  count: number;
  solutions: {
    color: string;
    density: number;
    direction: string;
    residual: number;
    scatterColor: string;
    shares: Vector[];
  }[];
}> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { direction: lightDirection } = await setLights(page, {});
      await setPageWitnessView(page, {});
      const {
        targets: { depth = new Float32Array(), normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Depth, WitnessTargetName.Normal, WitnessTargetName.Part]);
      const sky = await readPage<{ matrixWorld: number[]; projectionMatrixInverse: number[]; sunDirection: Vector }>(
        page,
        "readSceneSky",
      );
      const fog = await readPage<SceneFog>(page, "readSceneFog");
      const shoot = async (shares: { ambientShare: number; sunShare: number }): Promise<Buffer> => {
        await setLights(page, shares);
        await setPageWitnessView(page, { isAlone: true });
        return sharp(await page.screenshot())
          .resize(width, height, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer();
      };
      const lightShots = isLightSolved
        ? [await shoot({ ambientShare: 0, sunShare: 1 }), await shoot({ ambientShare: 1, sunShare: 0 })]
        : [await shoot({ ambientShare: 1, sunShare: 1 })];
      await setLights(page, { ambientShare: 1, sunShare: 1 });
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const matrixWorld = new Matrix4().fromArray(sky.matrixWorld);
      const projectionMatrixInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const eye = new Vector3().setFromMatrixPosition(matrixWorld).toArray();
      const toScene = (data: Buffer, pixel: number): Vector =>
        toSceneColor(
          new Color(...CHANNELS.map((channel) => toLinear((data[pixel * 3 + channel] ?? 0) / BYTE))),
        ).toArray() as Vector;
      const points: Point[] = [];
      for (let pixel = 0; pixel < width * height; pixel++) {
        const pixelDepth = depth[pixel * 4] ?? 0;
        if (pixelDepth <= fog.startDistance || !checkIsPartInterior(part, width, height, pixel)) continue;
        // The pixel's ray in the view, scaled to the depth along the view the witness wrote
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        const view = new Vector3(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5).applyMatrix4(
          projectionMatrixInverse,
        );
        const point = view
          .multiplyScalar(pixelDepth / -view.z)
          .applyMatrix4(matrixWorld)
          .toArray();
        const facing =
          (normal[pixel * 4] ?? 0) * lightDirection[0] +
          (normal[pixel * 4 + 1] ?? 0) * lightDirection[1] +
          (normal[pixel * 4 + 2] ?? 0) * lightDirection[2];
        points.push({
          facing,
          lights: lightShots.map((shot) => toScene(shot, pixel)),
          point,
          reference: toScene(reference, pixel),
        });
      }
      // Each direction's bins: their pixels, the medians of their lights' and reference colours and their mean scatter
      const readBins = (direction: Vector) => {
        const binMap = new Map<number, { points: Point[]; scatters: number[] }>();
        for (const entry of points) {
          const ray = new Vector3(...entry.point).sub(new Vector3(...eye));
          const band = DEPTH_BANDS.findIndex((far) => ray.length() < far);
          const scatter = Math.min(
            Math.max(ray.normalize().dot(new Vector3(...direction)), 0) ** fog.scatterPower * fog.scatterStrength,
            1,
          );
          const facingClass = isLightSolved
            ? entry.facing > FACING_COSINE
              ? 2
              : entry.facing < -FACING_COSINE
                ? 0
                : 1
            : 0;
          const key =
            (band * SCATTER_BIN_COUNT + Math.min(Math.floor(scatter * SCATTER_BIN_COUNT), SCATTER_BIN_COUNT - 1)) * 3 +
            facingClass;
          const bin = binMap.get(key) ?? { points: [], scatters: [] };
          bin.points.push(entry);
          bin.scatters.push(scatter);
          binMap.set(key, bin);
        }
        return [...binMap.values()].flatMap(({ points: binPoints, scatters }) =>
          binPoints.length < MIN_BIN_COUNT
            ? []
            : [
                {
                  lights: lightShots.map(
                    (_, light) =>
                      CHANNELS.map((channel) =>
                        readMedian(binPoints.map(({ lights }) => lights[light]?.[channel] ?? 0)),
                      ) as Vector,
                  ),
                  points: binPoints.map(({ point }) => point),
                  reference: CHANNELS.map((channel) =>
                    readMedian(binPoints.map(({ reference: color }) => color[channel])),
                  ) as Vector,
                  scatter: scatters.reduce((sum, value) => sum + value, 0) / scatters.length,
                },
              ],
        );
      };
      const solve = (density: number, bins: ReturnType<typeof readBins>): ReturnType<typeof solveFogColors> =>
        solveFogColors(
          bins.map(({ lights, points: binPoints, reference, scatter }) => ({
            lights,
            opacity:
              binPoints.reduce((sum, point) => sum + readFogOpacity(eye, point, { ...fog, density }), 0) /
              binPoints.length,
            reference,
            scatter,
            weight: binPoints.length,
          })),
          { isLightSolved },
        );
      const refine = (bins: ReturnType<typeof readBins>): ReturnType<typeof solveFogColors> & { density: number } => {
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
          const bins = readBins(direction);
          const solved =
            fixedDensity === undefined ? refine(bins) : { density: fixedDensity, ...solve(fixedDensity, bins) };
          return {
            color: toDisplayHex(solved.color),
            density: solved.density,
            direction: name,
            residual: solved.residual,
            scatterColor: toDisplayHex(solved.scatterColor),
            shares: solved.shares,
          };
        }),
      };
    },
    () => browser.close(),
  );
};
