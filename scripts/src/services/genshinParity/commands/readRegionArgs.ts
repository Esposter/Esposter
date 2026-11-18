import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// A region read from the `regionArgs` positionals, which arrive as strings, in the image's own pixels
export const readRegionArgs = ({
  height,
  width,
  x,
  y,
}: Record<"height" | "width" | "x" | "y", string>): ImageRegion => ({
  height: Number(height),
  width: Number(width),
  x: Number(x),
  y: Number(y),
});
