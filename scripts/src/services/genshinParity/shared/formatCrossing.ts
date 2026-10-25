import type { CrossingBudget } from "#src/models/genshinParity/CrossingBudget";
import type { CrossingReading } from "#src/models/genshinParity/page/CrossingReading";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";
import { formatFigure } from "#src/services/genshinParity/shared/formatFigure";
import { formatMeasures } from "#src/services/genshinParity/shared/formatMeasures";
import { formatRow } from "#src/services/genshinParity/shared/formatRow";
import { getGameDataFigure } from "#src/services/genshinParity/shared/getGameDataFigure";
import { getRequestsFigure } from "#src/services/genshinParity/shared/getRequestsFigure";

// A crossing as the meter prints it: its counts against its budget, then the time from the move to its settling and
// The main thread's time in long frames over it, which no budget holds, and the measures taken after the move
export const formatCrossing = (
  { bench, settledMs }: CrossingReading,
  budget: CrossingBudget | undefined,
): { isOver: boolean; lines: string[] } => {
  const tileCount = bench.measures.reduce((sum, { tileCount: measureTileCount }) => sum + measureTileCount, 0);
  const rows = [
    getRequestsFigure(budget, bench.requests),
    getGameDataFigure(budget, bench.gameDataBytes),
    { budget: budget?.tileCount, isChecked: true, name: "tiles rebuilt", unit: LoadFigureUnit.Count, value: tileCount },
  ].map((figure) => formatRow(figure));
  return {
    isOver: rows.some(({ isOver }) => isOver),
    lines: [
      "crossing, from the move to its settling:",
      ...rows.map(({ line }) => line),
      `${"settled".padEnd(16)}${formatFigure(settledMs, LoadFigureUnit.Milliseconds).padStart(12)}`,
      `${"long frames".padEnd(16)}${formatFigure(bench.longFrameMs, LoadFigureUnit.Milliseconds).padStart(12)}`,
      "",
      "crossing measures, slowest first:",
      ...formatMeasures(bench),
      "",
      `crossing requests ${bench.requests}, of which game data ${bench.gameDataRequests}; total ${formatFigure(bench.totalBytes, LoadFigureUnit.Kilobytes)}`,
    ],
  };
};
