import type { Vector } from "#src/models/shared/Vector";

import { toLab } from "#src/services/shared/toLab";
import { toLinear } from "#src/services/shared/toLinear";
import { toXyz } from "#src/services/shared/toXyz";

const toLabColour = (colour: Vector): Vector =>
  toLab(toXyz(colour.map((channel) => toLinear(channel / 255)) as Vector));
const computeLabDistance = (first: Vector, second: Vector): number =>
  Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
const parseHexColour = (hex: string): Vector =>
  [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as Vector;
// Classes a colour in bytes to the name of the tone nearest to it in Lab; a colour no tone is nearer than another to
// Stays with the first tone
export const createGroundToneClassifier = (tones: Record<string, string>): ((colour: Vector) => string) => {
  const labTones = Object.entries(tones).map(([name, hex]) => [name, toLabColour(parseHexColour(hex))] as const);
  return (colour) => {
    const lab = toLabColour(colour);
    return labTones.reduce((nearest, tone) =>
      computeLabDistance(lab, tone[1]) < computeLabDistance(lab, nearest[1]) ? tone : nearest,
    )[0];
  };
};
