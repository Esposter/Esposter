import type { FacadeGrid } from "#src/models/genshinAssets/fit/FacadeGrid";

import {
  GILDING_RED_BLUE_RATIO,
  TOWER_FACADE_DEEP_RECESS,
  TOWER_FACADE_SHALLOW_RECESS,
} from "#src/services/genshinAssets/shared/constants";

// A texel's metal reads in its mask's green channel past this
const METAL_THRESHOLD = 0.5;
// A facade grid's drawn cells sorted by what they are: the gilding, by its metal or its gold, and the stone by how far
// It stands from the lathe's wall, a deep or a shallow recess, standing out from it, or its face
export const classifyFacadeCells = ({
  colors,
  depths,
  metals,
  tags,
}: Pick<FacadeGrid, "colors" | "depths" | "metals" | "tags">): Record<
  "deep" | "drawn" | "face" | "gilded" | "raised" | "shallow",
  number[]
> => {
  const drawn = tags.flatMap((tag, cell) => (tag >= 0 ? [cell] : []));
  const checkIsGilded = (cell: number): boolean => {
    const [red = 0, , blue = 0] = colors[cell] ?? [];
    return (metals[cell] ?? 0) >= METAL_THRESHOLD || red > blue * GILDING_RED_BLUE_RATIO;
  };
  const stone = drawn.filter((cell) => !checkIsGilded(cell));
  const getDepth = (cell: number): number => depths[cell] ?? 0;
  return {
    deep: stone.filter((cell) => getDepth(cell) >= TOWER_FACADE_DEEP_RECESS),
    drawn,
    face: stone.filter((cell) => Math.abs(getDepth(cell)) < TOWER_FACADE_SHALLOW_RECESS),
    gilded: drawn.filter((cell) => checkIsGilded(cell)),
    raised: stone.filter((cell) => getDepth(cell) <= -TOWER_FACADE_SHALLOW_RECESS),
    shallow: stone.filter(
      (cell) => getDepth(cell) >= TOWER_FACADE_SHALLOW_RECESS && getDepth(cell) < TOWER_FACADE_DEEP_RECESS,
    ),
  };
};
