import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// The ground's colour in a region's raster, channel by channel: the median of the pixels outside every silhouette, so
// The terrain between a region's glyphs stands for the ground whatever a glyph covers of its own box. The silhouettes
// Are in the raster's own pixels, and a region they cover whole takes the median of all its pixels
export const computeGroundColour = (
  data: Uint8Array,
  channels: number,
  width: number,
  height: number,
  silhouettes: readonly ImageRegion[],
): number[] => {
  const pixelCount = width * height;
  const isInSilhouette = (pixel: number): boolean => {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    return silhouettes.some(
      (silhouette) =>
        x >= silhouette.x &&
        x < silhouette.x + silhouette.width &&
        y >= silhouette.y &&
        y < silhouette.y + silhouette.height,
    );
  };
  const allPixels = Array.from({ length: pixelCount }, (_value, pixel) => pixel);
  const outsidePixels = allPixels.filter((pixel) => !isInSilhouette(pixel));
  const sample = outsidePixels.length > 0 ? outsidePixels : allPixels;
  return Array.from({ length: channels }, (_value, channel) => {
    const values = sample
      .map((pixel) => data[pixel * channels + channel] ?? 0)
      .toSorted((firstValue, secondValue) => firstValue - secondValue);
    return values[Math.floor(values.length / 2)] ?? 0;
  });
};
