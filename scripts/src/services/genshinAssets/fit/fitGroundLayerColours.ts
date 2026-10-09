import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Vector } from "#src/models/shared/Vector";

import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { toLab } from "#src/services/shared/toLab";
import { toLinear } from "#src/services/shared/toLinear";
import { toXyz } from "#src/services/shared/toXyz";

// The ground's three palette tones, each named by its layer through its hue: the green is grass, the brown earth and the
// Pale tone rock, as the palette `fitSurfaceColours` reads off the base maps
const GROUND_LAYER_TONES: Record<string, string> = { Earth: "#837e69", Grass: "#53733e", Rock: "#b0b6c5" };

const toLabColour = (colour: Vector): Vector =>
  toLab(toXyz(colour.map((channel) => toLinear(channel / 255)) as Vector));
const computeLabDistance = (first: Vector, second: Vector): number =>
  Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
const parseHexColour = (hex: string): Vector =>
  [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as Vector;
// Each base-map texel is classed to the tone nearest to it in Lab, and each layer's colour is the area-weighted mean of
// The texels classed into it, as hex. A texel that no tone is nearer than another to stays with the first tone
export const computeGroundLayerColours = (
  samples: readonly SurfaceSample[],
  tones: Record<string, string> = GROUND_LAYER_TONES,
): Record<string, string> => {
  const labTones = Object.entries(tones).map(([layer, hex]) => [layer, toLabColour(parseHexColour(hex))] as const);
  const classes = Object.groupBy(samples, ({ colour }) => {
    const lab = toLabColour(colour);
    return labTones.reduce((nearest, tone) =>
      computeLabDistance(lab, tone[1]) < computeLabDistance(lab, nearest[1]) ? tone : nearest,
    )[0];
  });
  return Object.fromEntries(
    Object.entries(classes).flatMap(([layer, members]) =>
      members === undefined ? [] : [[layer, computeSurfaceTones(members, 1).color]],
    ),
  );
};
