import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// The first of a reference's own rectangles, its region, its plate's and its mask's, that falls outside the file it is
// Held in, named with its size and place; undefined when every one of them lies within the file
export const getOutsideRegion = (
  reference: ParityReference,
  file: Pick<ImageRegion, "height" | "width">,
): string | undefined => {
  const rectangles = [
    ...(reference.region === undefined ? [] : [{ label: "region", rectangle: reference.region }]),
    ...(reference.plate ?? []).map((rectangle) => ({ label: "plate", rectangle })),
    ...(reference.mask ?? []).map((rectangle) => ({ label: "mask", rectangle })),
  ];
  const outside = rectangles.find(
    ({ rectangle }) =>
      rectangle.x < 0 ||
      rectangle.y < 0 ||
      rectangle.x + rectangle.width > file.width ||
      rectangle.y + rectangle.height > file.height,
  );
  return outside === undefined
    ? undefined
    : `${outside.label} ${outside.rectangle.width}×${outside.rectangle.height} at ${outside.rectangle.x}, ${outside.rectangle.y}`;
};
