import type { LoadBudget } from "#src/models/genshinParity/LoadBudget";
import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { Figure } from "#src/models/genshinParity/shared/Figure";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";
import { formatCrossing } from "#src/services/genshinParity/shared/formatCrossing";
import { formatFigure } from "#src/services/genshinParity/shared/formatFigure";
import { formatMeasures } from "#src/services/genshinParity/shared/formatMeasures";
import { formatRow } from "#src/services/genshinParity/shared/formatRow";
import { getGameDataFigure } from "#src/services/genshinParity/shared/getGameDataFigure";
import { getRequestsFigure } from "#src/services/genshinParity/shared/getRequestsFigure";

// A screen's load as the meter prints it: one row per figure against its budget, then the measures the load steps took,
// Slowest first, and what the requests fetched and the scene drew, then its crossing when one was measured. `isOver` is
// Whether a figure checked here is past its budget, which fails the command
export const formatLoadMeter = (
  { bench, crossing, readyMs }: LoadReading,
  budget: LoadBudget | undefined,
  machine: string,
): { isOver: boolean; lines: string[] } => {
  const isTimeChecked = budget?.machine === machine;
  const objects = Object.values(bench.kindCounts).reduce((sum, count) => sum + count, 0);
  const figures: Figure[] = [
    {
      budget: budget?.readyMs,
      isChecked: isTimeChecked,
      name: "ready",
      unit: LoadFigureUnit.Milliseconds,
      value: readyMs,
    },
    getRequestsFigure(budget, bench.requests),
    getGameDataFigure(budget, bench.gameDataBytes),
    { budget: budget?.objects, isChecked: true, name: "objects", unit: LoadFigureUnit.Count, value: objects },
    {
      budget: budget?.geometries,
      isChecked: true,
      name: "geometries",
      unit: LoadFigureUnit.Count,
      value: bench.geometries,
    },
    { budget: budget?.textures, isChecked: true, name: "textures", unit: LoadFigureUnit.Count, value: bench.textures },
    { budget: budget?.programs, isChecked: true, name: "programs", unit: LoadFigureUnit.Count, value: bench.programs },
  ];
  const rows = figures.map((figure) => formatRow(figure));
  const crossingMeter = crossing ? formatCrossing(crossing, budget?.crossing) : { isOver: false, lines: [] };
  const kinds = Object.entries(bench.kindCounts)
    .toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .map(([kind, count]) => `${count} ${kind}`)
    .join(", ");
  return {
    isOver:
      rows.some(({ isOver }) => isOver) || crossingMeter.isOver || bench.measures.some(({ isFailed }) => isFailed),
    lines: [
      ...rows.map(({ line }) => line),
      "",
      "measures, slowest first:",
      ...formatMeasures(bench),
      "",
      `requests ${bench.requests}, of which game data ${bench.gameDataRequests}; total ${formatFigure(bench.totalBytes, LoadFigureUnit.Kilobytes)}`,
      `objects by kind: ${kinds || "none"}`,
      ...(crossing ? ["", ...crossingMeter.lines] : []),
    ],
  };
};
