import type { LiyueLatticeOptions } from "#src/models/kits/liyue/LiyueLatticeOptions";

import { createLiyueWallBox } from "#src/kits/liyue/createLiyueWallBox";
import { LATTICE_BAR_SIZE, LATTICE_CELL } from "#src/kits/liyue/constants";

// An openwork bay as boxes: a rail along its sill and along its head, and a bar every cell between them
export const createLiyueLatticeBoxes = ({
  end,
  face,
  head,
  isAlongX,
  sill,
  start,
}: LiyueLatticeOptions): number[][] => {
  const createBar = (barStart: number, barEnd: number, bottom: number, top: number): number[] =>
    createLiyueWallBox({
      bottom,
      end: barEnd,
      face,
      isAlongX,
      start: barStart,
      thickness: LATTICE_BAR_SIZE,
      top,
    });
  const bars: number[][] = [];
  for (let cell = start + LATTICE_CELL; cell < end; cell += LATTICE_CELL)
    bars.push(createBar(cell - LATTICE_BAR_SIZE / 2, cell + LATTICE_BAR_SIZE / 2, sill, head));
  return [
    createBar(start, end, sill, sill + LATTICE_BAR_SIZE),
    createBar(start, end, head - LATTICE_BAR_SIZE, head),
    ...bars,
  ];
};
