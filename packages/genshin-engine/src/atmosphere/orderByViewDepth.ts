import type { Matrix4 } from "three";

// The indices of the places given, farthest from the camera first: by their depth along its view, as three sorts its
// Transparent objects, read off the model-view matrix's third row, which carries a place to its view's z
export const orderByViewDepth = (places: readonly (readonly number[])[], { elements }: Matrix4): number[] => {
  const depths = places.map(
    ([x = 0, y = 0, z = 0]) => elements[2] * x + elements[6] * y + elements[10] * z + elements[14],
  );
  return depths.map((_, index) => index).toSorted((first, second) => (depths[first] ?? 0) - (depths[second] ?? 0));
};
