import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";

import { applyGradeCurve } from "#src/services/genshinParity/applyGradeCurve";
import { fitFog } from "#src/services/genshinParity/fitFog";
import { fitGradeCurve } from "#src/services/genshinParity/fitGradeCurve";
import { fitLight } from "#src/services/genshinParity/fitLight";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import sharp from "sharp";

type Vector = [number, number, number];
// The sun's direction is first read off a grid of headings and elevations this many degrees apart, then refined
const DIRECTION_GRID_STEP = 15;
const DIRECTION_REFINE_ITERATIONS = 60;
// The elevations the sun is sought between: grazing light lets a vast sun explain a sliver of lit pixels
const MIN_SUN_ELEVATION = 5;
const MAX_SUN_ELEVATION = 85;
// The spread of the drawn pixels' depths, as their deviation over their mean, under which the fog's density and colour
// Cannot be told apart, so the fog is held clear rather than fitted
const MIN_FOG_DEPTH_SPREAD = 0.25;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const toDisplay = (value: number): number =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * Math.max(value, 0) ** (1 / 2.4) - 0.055;
const toDirection = ([heading = 0, elevation = 0]: readonly number[]): Vector => {
  const azimuth = (heading * Math.PI) / 180;
  const altitude = (elevation * Math.PI) / 180;
  return [Math.cos(altitude) * Math.sin(azimuth), Math.sin(altitude), Math.cos(altitude) * Math.cos(azimuth)];
};
const readLitShare = (normal: Vector, direction: Vector): number =>
  Math.max(0, normal[0] * direction[0] + normal[1] * direction[1] + normal[2] * direction[2]);
const readTarget = (values: Float32Array, pixel: number): Vector => [
  values[pixel * 4] ?? 0,
  values[pixel * 4 + 1] ?? 0,
  values[pixel * 4 + 2] ?? 0,
];
const readRms = (residuals: readonly number[]): number =>
  Math.sqrt(residuals.reduce((sum, value) => sum + value ** 2, 0) / Math.max(residuals.length, 1));
// A scene's frame-wide terms fitted by least squares over the pixels the witness draws its parts on, in the order light
// Meets the eye, each held for the next: the sun's colour and the ambient light's from the albedo and the normal, the
// Reference read as plain sRGB (the sun's direction the one outer solve, over its heading and elevation, a grid then
// The simplex); the fog's colour and density from the depth, held clear where the drawn depths barely spread, which
// Cannot tell them apart; then each channel's grade, a monotone curve from the colour those predict to the reference's,
// Beside the plain sRGB curve's residual it improves on. Light and fog are fitted in linear colour, the grade in display
// Values. Given grading tables (each an unwrapped strip of its cube), each is scored by how far the predicted colour
// Through it falls from the reference
export const calibrateScene = async (
  gbuffer: WitnessGbuffer,
  image: Buffer,
  lutPaths: readonly string[] = [],
): Promise<{
  fog: { color: Vector; density: number; residual: number };
  grade: { knots: number[][]; plainResidual: number; residual: number };
  isFogFitted: boolean;
  light: { ambient: Vector; direction: [number, number]; residual: number; sun: Vector };
  luts: { path: string; residual: number }[];
}> => {
  const { albedo, depth, height, normal, part, width } = gbuffer;
  const { data } = await sharp(image)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = Array.from({ length: width * height }, (_, pixel) => pixel).filter((pixel) => part[pixel * 4] !== 0);
  const displayed = pixels.map((pixel): Vector => [
    (data[pixel * 3] ?? 0) / 255,
    (data[pixel * 3 + 1] ?? 0) / 255,
    (data[pixel * 3 + 2] ?? 0) / 255,
  ]);
  const samples = pixels.map((pixel, index) => {
    const [red = 0, green = 0, blue = 0] = displayed[index] ?? [];
    return {
      albedo: readTarget(albedo, pixel),
      color: [toLinear(red), toLinear(green), toLinear(blue)] satisfies Vector,
      depth: depth[pixel * 4] ?? 0,
      normal: readTarget(normal, pixel),
    };
  });
  const readDirectionResidual = (angles: readonly number[]): number => {
    const elevation = angles[1] ?? 0;
    return elevation < MIN_SUN_ELEVATION || elevation > MAX_SUN_ELEVATION
      ? Infinity
      : fitLight(samples, toDirection(angles)).residual;
  };
  let start: [number, number] = [0, DIRECTION_GRID_STEP];
  for (let heading = 0; heading < 360; heading += DIRECTION_GRID_STEP)
    for (let elevation = DIRECTION_GRID_STEP; elevation < 90; elevation += DIRECTION_GRID_STEP)
      if (readDirectionResidual([heading, elevation]) < readDirectionResidual(start)) start = [heading, elevation];
  const { point } = await minimizeNelderMead(
    (angles) => Promise.resolve(readDirectionResidual(angles)),
    start,
    [DIRECTION_GRID_STEP / 3, DIRECTION_GRID_STEP / 3],
    DIRECTION_REFINE_ITERATIONS,
  );
  const direction: [number, number] = [point[0] ?? 0, point[1] ?? 0];
  const sunDirection = toDirection(direction);
  const light = { ...fitLight(samples, sunDirection), direction };
  const lit = samples.map(({ albedo: [red, green, blue], normal: facing }): Vector => {
    const share = readLitShare(facing, sunDirection);
    const [sunRed, sunGreen, sunBlue] = light.sun;
    const [ambientRed, ambientGreen, ambientBlue] = light.ambient;
    return [
      red * (sunRed * share + ambientRed),
      green * (sunGreen * share + ambientGreen),
      blue * (sunBlue * share + ambientBlue),
    ];
  });
  const depths = samples.map(({ depth: sampleDepth }) => sampleDepth);
  const meanDepth = depths.reduce((sum, value) => sum + value, 0) / Math.max(depths.length, 1);
  const depthSpread =
    Math.sqrt(depths.reduce((sum, value) => sum + (value - meanDepth) ** 2, 0) / Math.max(depths.length, 1)) /
    Math.max(meanDepth, Number.EPSILON);
  const isFogFitted = depthSpread >= MIN_FOG_DEPTH_SPREAD;
  const fog = isFogFitted
    ? fitFog(
        samples.map(({ color, depth: sampleDepth }, index) => ({
          color,
          depth: sampleDepth,
          lit: lit[index] ?? [0, 0, 0],
        })),
      )
    : { color: [0, 0, 0] satisfies Vector, density: 0, residual: light.residual };
  const predicted = lit.map((color, index): Vector => {
    const share = 1 - Math.exp(-fog.density * (samples[index]?.depth ?? 0));
    const [red, green, blue] = color.map((value, channel) =>
      toDisplay((1 - share) * value + share * (fog.color[channel] ?? 0)),
    );
    return [red ?? 0, green ?? 0, blue ?? 0];
  });
  const knots = [0, 1, 2].map(
    (channel) =>
      fitGradeCurve(
        predicted.map((color, index) => ({ from: color[channel] ?? 0, to: displayed[index]?.[channel] ?? 0 })),
      ).knots,
  );
  const readResidual = (grade: (value: number, channel: number) => number): number =>
    readRms(
      predicted.flatMap((color, index) =>
        color.map((value, channel) => grade(value, channel) - (displayed[index]?.[channel] ?? 0)),
      ),
    );
  const luts = await Promise.all(
    lutPaths.map(async (path) => {
      const { data: table, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      // A strip of the cube's slices side by side: the blue picks the slice, red runs along it, green down it
      const size = info.height;
      const residuals = predicted.flatMap((color, index) => {
        const [x = 0, y = 0, z = 0] = color.map((value) => Math.round(Math.min(Math.max(value, 0), 1) * (size - 1)));
        const offset = (y * info.width + z * size + x) * 3;
        return [0, 1, 2].map((channel) => (table[offset + channel] ?? 0) / 255 - (displayed[index]?.[channel] ?? 0));
      });
      return { path, residual: readRms(residuals) };
    }),
  );
  return {
    fog,
    grade: {
      knots,
      plainResidual: readResidual((value) => value),
      residual: readResidual((value, channel) => applyGradeCurve(knots[channel] ?? [], value)),
    },
    isFogFitted,
    light,
    luts: luts.toSorted((first, second) => first.residual - second.residual),
  };
};
