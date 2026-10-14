import type { CrossingBudget } from "#src/models/genshinParity/CrossingBudget";
import type { LoadBudget } from "#src/models/genshinParity/LoadBudget";
import type { CrossingReading } from "#src/models/genshinParity/page/CrossingReading";
import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { LoadBench } from "genshin-world/parity/models/LoadBench";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

const METER_CELLS = 20;
const BYTES_PER_KILOBYTE = 1024;

interface Figure {
  budget?: number;
  // Whether the figure is checked here: a count always is, a time only on the machine its budget names
  isChecked: boolean;
  name: string;
  unit: LoadFigureUnit;
  value: number;
}

const formatFigure = (value: number, unit: LoadFigureUnit): string => {
  if (unit === LoadFigureUnit.Milliseconds) return `${value.toFixed(0)} ms`;
  if (unit === LoadFigureUnit.Kilobytes) return `${(value / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
  return `${value}`;
};

// The meter's row: the value, its budget, the share of the budget used as a bar, and OVER when past it. A time past its
// Budget on another machine is printed beside the row and does not fail
const formatRow = ({ budget, isChecked, name, unit, value }: Figure): { isOver: boolean; line: string } => {
  const label = name.padEnd(16);
  const figure = formatFigure(value, unit).padStart(12);
  if (budget === undefined) return { isOver: false, line: `${label}${figure}   no budget yet` };
  const share = budget > 0 ? value / budget : 0;
  const filled = Math.min(METER_CELLS, Math.round(share * METER_CELLS));
  const bar = `${"#".repeat(filled)}${"-".repeat(METER_CELLS - filled)}`;
  const percent = `${Math.round(share * 100)}%`.padStart(5);
  const isOver = value > budget;
  let status = "";
  if (isOver) status = isChecked ? "OVER" : "over, not checked on this machine";
  return {
    isOver: isOver && isChecked,
    line: `${label}${figure} / ${formatFigure(budget, unit).padEnd(12)} [${bar}]${percent} ${status}`.trimEnd(),
  };
};

// The game data a load or a crossing fetched, checked against the budget its meter names for it
const getGameDataFigure = (budget: undefined | { gameDataBytes?: number }, gameDataBytes: number): Figure => ({
  budget: budget?.gameDataBytes,
  isChecked: true,
  name: "game data",
  unit: LoadFigureUnit.Kilobytes,
  value: gameDataBytes,
});

// The requests a load or a crossing made, checked against the budget its meter names for it
const getRequestsFigure = (budget: undefined | { requests?: number }, requests: number): Figure => ({
  budget: budget?.requests,
  isChecked: true,
  name: "requests",
  unit: LoadFigureUnit.Count,
  value: requests,
});

// The measures the load steps took, slowest first, each with the tiles it rebuilt when it rebuilt any
const formatMeasures = ({ measures }: LoadBench): string[] =>
  measures
    .toSorted((firstMeasure, secondMeasure) => secondMeasure.duration - firstMeasure.duration)
    .map(
      ({ duration, isFailed, name, tileCount }) =>
        `  ${name.padEnd(24)} ${duration.toFixed(1)} ms${tileCount > 0 ? `, ${tileCount} tiles rebuilt` : ""}${isFailed ? " FAILED" : ""}`,
    );

// A crossing as the meter prints it: its counts against its budget, then the time from the move to its settling and
// The main thread's time in long frames over it, which no budget holds, and the measures taken after the move
const formatCrossing = (
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
    .toSorted(([, first], [, second]) => second - first)
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
