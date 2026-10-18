import { SPECK_SHARE } from "#src/services/genshinParity/shared/constants";
import { removeMaskSpecks } from "#src/services/genshinParity/shared/removeMaskSpecks";

// A glyph's strokes in an image, 1 for ink: each pixel goes to the nearer of the glyph's colour and its ground's, the ground
// Being the median colour of the box's one-pixel border, which is paper around the glyph, or of the whole box where the border
// Holds no pixel. A glyph over a varied painting splits from it where the colour at a corner would not stand for its ground,
// And specks are cleared from what is left
export const splitGlyph = (
  data: Uint8Array,
  channels: number,
  width: number,
  height: number,
  ink: readonly number[],
): Uint8Array => {
  const pixelCount = width * height;
  const channelAt = (pixel: number, channel: number): number => data[pixel * channels + channel] ?? 0;
  const pixels = Array.from({ length: pixelCount }, (_value, pixel) => pixel);
  const isOnBorder = (pixel: number): boolean => {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    return x === 0 || y === 0 || x === width - 1 || y === height - 1;
  };
  const border = pixels.filter((pixel) => isOnBorder(pixel));
  const groundPixels = border.length > 0 ? border : pixels;
  const ground = ink.map((_value, channel) => {
    const values = groundPixels
      .map((pixel) => channelAt(pixel, channel))
      .toSorted((firstValue, secondValue) => firstValue - secondValue);
    return values[Math.floor(values.length / 2)] ?? 0;
  });
  const distanceTo = (pixel: number, colour: readonly number[]): number =>
    Math.hypot(...colour.map((value, channel) => channelAt(pixel, channel) - value));
  const isInk = Uint8Array.from({ length: pixelCount }, (_value, pixel) =>
    Number(distanceTo(pixel, ink) < distanceTo(pixel, ground)),
  );
  removeMaskSpecks(isInk, width, height, pixelCount * SPECK_SHARE);
  return isInk;
};
