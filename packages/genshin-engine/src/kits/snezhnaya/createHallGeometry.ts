import type { HallOptions } from "#src/models/kits/snezhnaya/HallOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";

// The capital kit's hall as its storeys, each a box inset by the setback from the one below, so the stack steps back
// As it rises
export const createHallGeometry = ({
  depth,
  setback,
  storeyCount,
  storeyHeight,
  width,
}: HallOptions): BufferGeometry => {
  const boxes = Array.from({ length: storeyCount }, (_, storey) => {
    const inset = storey * setback;
    const footHeight = storey * storeyHeight;
    return [
      -width / 2 + inset,
      footHeight,
      -depth / 2 + inset,
      width / 2 - inset,
      footHeight + storeyHeight,
      depth / 2 - inset,
    ];
  });
  return createBoxesGeometry(boxes);
};
