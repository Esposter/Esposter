import type { PositionalArgDef } from "citty";

// A region of an image in its own pixels, as every command reading one takes it
export const regionArgs: Record<"height" | "width" | "x" | "y", PositionalArgDef & { required: true }> = {
  x: { description: "Left edge, in the image's pixels", required: true, type: "positional" },
  y: { description: "Top edge, in the image's pixels", required: true, type: "positional" },
  width: { description: "Width, in the image's pixels", required: true, type: "positional" },
  height: { description: "Height, in the image's pixels", required: true, type: "positional" },
};
