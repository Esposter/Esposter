import type { ReliefLayer } from "#src/models/genshinAssets/fit/ReliefLayer";

import { findNearestEdgePoint } from "#src/services/genshinAssets/fit/findNearestEdgePoint";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";

// Where between a corner and the nearest point of the depth below the cells are read for a slope
const SLOPE_SAMPLES = [0.25, 0.5, 0.75];

// A relief seen from the front, its height over each cell of a grid (none where nothing stands), as a layer at each of
// Its depths, deepest first: every loop round the cells standing at least that far out, each corner with its foot on
// The depth below, the nearest point of that depth's loops where the cells between them slope, so its wall leans
// Down as the relief's faces do, and the corner itself where they do not, so its wall stands straight. A loop whose
// Wall stands straight all round keeps no feet. A piece cut from a larger relief finds its feet and reads its slopes
// Over the whole relief (`around`), so a slope it shares with its neighbours leans across, not into the cut beside it
export const fitReliefLayers = (
  heights: Float32Array,
  depths: readonly number[],
  grid: {
    cellSize: number;
    corner: readonly [number, number];
    decimals: number;
    minCells: number;
    tolerance: number;
    width: number;
  },
  around: Float32Array = heights,
): ReliefLayer[] => {
  const { cellSize, corner, decimals, width } = grid;
  const [cornerX, cornerY] = corner;
  // A height counts as a depth within half the last decimal the depths are kept to
  const tolerance = 10 ** -decimals / 2;
  const readHeight = ([x, y]: [number, number]): number => {
    const column = Math.floor((x - cornerX) / cellSize);
    const row = Math.floor((y - cornerY) / cellSize);
    if (column < 0 || column >= width || row < 0) return -Infinity;
    return around[row * width + column] ?? -Infinity;
  };
  const cells = [...heights.keys()];
  const traceLayer = (values: Float32Array, depth: number): [number, number][][] =>
    traceCellLoops(
      cells.filter((cell) => (values[cell] ?? -Infinity) >= depth - tolerance),
      grid,
    );
  const layerLoops = depths.map((depth) => traceLayer(heights, depth));
  return depths.map((depth, layer) => {
    const below = depths[layer - 1] ?? -Infinity;
    const belowLoops = layer === 0 ? [] : traceLayer(around, below);
    return {
      depth,
      loops: (layerLoops[layer] ?? []).map((points) => {
        const foot = points.map((point): [number, number] => {
          if (belowLoops.length === 0) return point;
          const nearest = findNearestEdgePoint(belowLoops, point);
          const isSlope = SLOPE_SAMPLES.every((share) => {
            const height = readHeight([
              point[0] + share * (nearest[0] - point[0]),
              point[1] + share * (nearest[1] - point[1]),
            ]);
            return height > below + tolerance && height < depth - tolerance;
          });
          return isSlope ? [roundFitted(nearest[0], decimals), roundFitted(nearest[1], decimals)] : point;
        });
        const isStraight = foot.every((point, index) => point === points[index]);
        return { foot: isStraight ? [] : foot, points };
      }),
    };
  });
};
