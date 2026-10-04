import type { GradeOptions } from "#src/post/GradeOptions";

import { MAX_BYTE } from "#src/constants";

const RED_LUMINANCE = 0.2126;
const GREEN_LUMINANCE = 0.7152;
const BLUE_LUMINANCE = 0.0722;
const CONTRAST_PIVOT = 0.5;
// One channel pushed toward its grey or away from it by the saturation, spread about the middle by the contrast,
// Then tinted, and stored as a byte
const toGradedByte = (
  channel: number,
  luminance: number,
  saturation: number,
  contrast: number,
  tint: number,
): number => {
  const graded = (luminance + (channel - luminance) * saturation - CONTRAST_PIVOT) * contrast + CONTRAST_PIVOT + tint;
  return Math.round(Math.min(Math.max(graded, 0), 1) * MAX_BYTE);
};
// A grade as a cube of RGBA bytes, red along x fastest, then green, then blue, as a 3D texture reads it. The shadow
// Tint is weighted by the square of a colour's darkness and the highlight tint by the square of its luminance, so
// Each reaches only its own end of the range
export const computeGradeLut = ({
  contrast,
  highlightTint,
  saturation,
  shadowTint,
  size,
}: GradeOptions): Uint8Array => {
  const values = new Uint8Array(size * size * size * 4);
  const step = 1 / (size - 1);
  let offset = 0;

  for (let blueIndex = 0; blueIndex < size; blueIndex++)
    for (let greenIndex = 0; greenIndex < size; greenIndex++)
      for (let redIndex = 0; redIndex < size; redIndex++) {
        const red = redIndex * step;
        const green = greenIndex * step;
        const blue = blueIndex * step;
        const luminance = red * RED_LUMINANCE + green * GREEN_LUMINANCE + blue * BLUE_LUMINANCE;
        const shadowWeight = (1 - luminance) * (1 - luminance);
        const highlightWeight = luminance * luminance;
        const redTint = shadowTint[0] * shadowWeight + highlightTint[0] * highlightWeight;
        const greenTint = shadowTint[1] * shadowWeight + highlightTint[1] * highlightWeight;
        const blueTint = shadowTint[2] * shadowWeight + highlightTint[2] * highlightWeight;
        values[offset] = toGradedByte(red, luminance, saturation, contrast, redTint);
        values[offset + 1] = toGradedByte(green, luminance, saturation, contrast, greenTint);
        values[offset + 2] = toGradedByte(blue, luminance, saturation, contrast, blueTint);
        values[offset + 3] = MAX_BYTE;
        offset += 4;
      }

  return values;
};
