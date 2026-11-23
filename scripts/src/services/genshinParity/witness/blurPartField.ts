import { CHANNELS } from "#src/services/genshinParity/shared/constants";

// Each image's mean over the part pixels within `radius` of each part pixel, channel by channel: the smooth field a
// Gain is read from, the structure's pixels bounding anything smooth
export const blurPartField = (
  source: Float32Array,
  {
    checkIsPart,
    height,
    radius,
    width,
  }: { checkIsPart: (pixel: number) => boolean; height: number; radius: number; width: number },
): Float32Array => {
  const count = width * height;
  const blurred = new Float32Array(source.length);
  for (let pixel = 0; pixel < count; pixel++) {
    if (!checkIsPart(pixel)) continue;
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    let neighbourCount = 0;
    for (let rowOffset = -radius; rowOffset <= radius; rowOffset++)
      for (let columnOffset = -radius; columnOffset <= radius; columnOffset++) {
        const [neighbourColumn, neighbourRow] = [column + columnOffset, row + rowOffset];
        if (neighbourColumn < 0 || neighbourRow < 0 || neighbourColumn >= width || neighbourRow >= height) continue;
        const neighbour = neighbourRow * width + neighbourColumn;
        if (!checkIsPart(neighbour)) continue;
        neighbourCount++;
        for (const channel of CHANNELS)
          blurred[pixel * CHANNELS.length + channel] =
            (blurred[pixel * CHANNELS.length + channel] ?? 0) + (source[neighbour * CHANNELS.length + channel] ?? 0);
      }
    for (const channel of CHANNELS)
      blurred[pixel * CHANNELS.length + channel] =
        (blurred[pixel * CHANNELS.length + channel] ?? 0) / Math.max(neighbourCount, 1);
  }
  return blurred;
};
