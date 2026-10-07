import type { PlanTones } from "#src/models/genshinAssets/fit/PlanTones";
import type { Vector } from "#src/models/shared/Vector";

import { blurWithinTags } from "#src/services/genshinAssets/fit/blurWithinTags";
import { clusterColours } from "#src/services/genshinAssets/fit/clusterColours";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import { GILDING_RED_BLUE_RATIO } from "#src/services/genshinAssets/shared/constants";
import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

// Each cell's colour read past its texture's speckle, blurred over the cell either side within its own tag
const TONE_BLUR_CELLS = 1;
// The tones a surface is painted in, read off the linear colour its texture paints each cell of a plan with: its
// Gilding, the cells far redder than blue, and the rest of its drawn cells grouped into as many tones as asked by their
// Colours past the speckle in CIELab (`clusterColours`), so two tones are told apart as the eye tells them. The tone
// Most cells show is the stone the rest are drawn over, and each other tone and the gilding are traced as loops
// (`traceCellLoops`, which drops a speck); every shade is its cells' mean colour over the stone's
export const fitPlanTones = (
  colors: readonly Vector[],
  tags: Int16Array,
  {
    grid,
    height,
    stone,
    toneCount,
  }: { grid: Parameters<typeof traceCellLoops>[1]; height: number; stone: Vector; toneCount: number },
): PlanTones => {
  const { width } = grid;
  const computeShade = (cells: readonly number[]): Vector =>
    ([0, 1, 2] as const).map((channel) =>
      roundFitted(
        cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) /
          Math.max(cells.length, 1) /
          (stone[channel] || 1),
      ),
    ) as Vector;
  const drawn = Array.from({ length: colors.length }, (_value, cell) => cell).filter((cell) => (tags[cell] ?? -1) >= 0);
  const checkIsGilded = (cell: number): boolean => {
    const [red = 0, , blue = 0] = colors[cell] ?? [];
    return red > blue * GILDING_RED_BLUE_RATIO;
  };
  const painted = drawn.filter((cell) => !checkIsGilded(cell));
  const [blurredRed, blurredGreen, blurredBlue] = ([0, 1, 2] as const).map((channel) =>
    blurWithinTags(
      Float32Array.from(colors, (color) => color[channel]),
      tags,
      { height, radius: TONE_BLUR_CELLS, width },
    ),
  );
  const clusters = clusterColours(
    painted.map((cell) => toLab(toXyz([blurredRed?.[cell] ?? 0, blurredGreen?.[cell] ?? 0, blurredBlue?.[cell] ?? 0]))),
    toneCount,
  );
  const [stoneCells = [], ...toneCells] = Array.from({ length: toneCount }, (_tone, tone) =>
    painted.filter((_cell, index) => clusters[index] === tone),
  ).toSorted((firstCells, secondCells) => secondCells.length - firstCells.length);
  return {
    stone: computeShade(stoneCells),
    tones: [...toneCells, drawn.filter((cell) => checkIsGilded(cell))].flatMap((cells) => {
      const loops = traceCellLoops(cells, grid);
      return loops.length === 0 ? [] : [{ loops, shade: computeShade(cells) }];
    }),
  };
};
