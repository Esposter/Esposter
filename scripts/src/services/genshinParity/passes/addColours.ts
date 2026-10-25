import type { Vector } from "#src/models/shared/Vector";

export const addColours = (
  [firstRed, firstGreen, firstBlue]: Vector,
  [secondRed, secondGreen, secondBlue]: Vector,
): Vector => [firstRed + secondRed, firstGreen + secondGreen, firstBlue + secondBlue];
