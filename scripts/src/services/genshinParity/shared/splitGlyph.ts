import { SPECK_SHARE } from "#src/services/genshinParity/shared/constants";
import { removeMaskSpecks } from "#src/services/genshinParity/shared/removeMaskSpecks";

// A glyph's strokes in an image, 1 for ink: each pixel goes to the nearer of the glyph's colour and its ground's, the
// Ground being the colour `computeGroundColour` reads off the region's terrain between its glyphs, so a glyph over a
// Varied painting splits from the ground around it, and specks are cleared from what is left
export const splitGlyph = (
  data: Uint8Array,
  channels: number,
  width: number,
  height: number,
  ink: readonly number[],
  ground: readonly number[],
): Uint8Array => {
  const pixelCount = width * height;
  const channelAt = (pixel: number, channel: number): number => data[pixel * channels + channel] ?? 0;
  const distanceTo = (pixel: number, colour: readonly number[]): number =>
    Math.hypot(...colour.map((value, channel) => channelAt(pixel, channel) - value));
  const isInk = Uint8Array.from({ length: pixelCount }, (_value, pixel) =>
    Number(distanceTo(pixel, ink) < distanceTo(pixel, ground)),
  );
  removeMaskSpecks(isInk, width, height, pixelCount * SPECK_SHARE);
  return isInk;
};
