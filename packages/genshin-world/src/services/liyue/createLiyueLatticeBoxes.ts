import type { LiyueLatticeOptions } from "#src/models/liyue/LiyueLatticeOptions";

import { LIYUE_LATTICE_BAR_SIZE, LIYUE_LATTICE_CELL } from "#src/services/liyue/constants";
import { createLiyueWallBox } from "#src/services/liyue/createLiyueWallBox";

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
      thickness: LIYUE_LATTICE_BAR_SIZE,
      top,
    });
  const bars: number[][] = [];
  for (let cell = start + LIYUE_LATTICE_CELL; cell < end; cell += LIYUE_LATTICE_CELL)
    bars.push(createBar(cell - LIYUE_LATTICE_BAR_SIZE / 2, cell + LIYUE_LATTICE_BAR_SIZE / 2, sill, head));
  return [
    createBar(start, end, sill, sill + LIYUE_LATTICE_BAR_SIZE),
    createBar(start, end, head - LIYUE_LATTICE_BAR_SIZE, head),
    ...bars,
  ];
};
