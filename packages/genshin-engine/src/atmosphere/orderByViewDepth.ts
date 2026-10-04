import type { Matrix4 } from "three";

// Puts the places' indices in `order` farthest from the camera first: by their depth along its view, as three sorts
// Its transparent objects, read off the model-view matrix's third row, which carries a place to its view's z, and by
// Their index where two share a depth. The order is sorted in place by insertion from where the last frame left it,
// Which a turning camera barely disturbs, so a frame costs one pass over the places and allocates nothing, its depths
// Written into the buffer given. Tells whether any index moved
export const orderByViewDepth = (
  places: readonly (readonly number[])[],
  { elements }: Matrix4,
  depths: Float64Array,
  order: Uint32Array,
): boolean => {
  for (let index = 0; index < places.length; index++) {
    const place = places[index];
    depths[index] =
      elements[2] * (place?.[0] ?? 0) +
      elements[6] * (place?.[1] ?? 0) +
      elements[10] * (place?.[2] ?? 0) +
      elements[14];
  }
  let isReordered = false;
  for (let index = 1; index < order.length; index++) {
    const place = order[index] ?? 0;
    const depth = depths[place] ?? 0;
    let slot = index;
    while (slot > 0) {
      const nearer = order[slot - 1] ?? 0;
      const nearerDepth = depths[nearer] ?? 0;
      if (nearerDepth < depth || (nearerDepth === depth && nearer < place)) break;
      order[slot] = nearer;
      slot--;
    }
    if (slot === index) continue;
    order[slot] = place;
    isReordered = true;
  }
  return isReordered;
};
