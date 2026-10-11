import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { LoadBudget } from "#src/models/genshinParity/LoadBudget";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

const METER_CELLS = 20;
const BYTES_PER_KILOBYTE = 1024;

interface Figure {
  budget: number | undefined;
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

// A screen's load as the meter prints it: one row per figure against its budget, then the measures the load steps took,
// Slowest first, and what the requests fetched and the scene drew. `isFailed` is whether a figure checked here is past
// Its budget or a load step failed, either of which fails the command: a screen ready after a failed step loaded only
// Part of itself, so its figures can sit well within budget
export const formatLoadMeter = (
  { bench, readyMs }: LoadReading,
  budget: LoadBudget | undefined,
  machine: string,
): { isFailed: boolean; lines: string[] } => {
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
    { budget: budget?.requests, isChecked: true, name: "requests", unit: LoadFigureUnit.Count, value: bench.requests },
    {
      budget: budget?.gameDataBytes,
      isChecked: true,
      name: "game data",
      unit: LoadFigureUnit.Kilobytes,
      value: bench.gameDataBytes,
    },
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
  const measures = bench.measures
    .toSorted((first, second) => second.duration - first.duration)
    .map(
      ({ duration, isFailed, name }) => `  ${name.padEnd(24)} ${duration.toFixed(1)} ms${isFailed ? " FAILED" : ""}`,
    );
  const kinds = Object.entries(bench.kindCounts)
    .toSorted(([, first], [, second]) => second - first)
    .map(([kind, count]) => `${count} ${kind}`)
    .join(", ");
  return {
    isFailed: rows.some(({ isOver }) => isOver) || bench.measures.some(({ isFailed }) => isFailed),
    lines: [
      ...rows.map(({ line }) => line),
      "",
      "measures, slowest first:",
      ...measures,
      "",
      `requests ${bench.requests}, of which game data ${bench.gameDataRequests}; total ${formatFigure(bench.totalBytes, LoadFigureUnit.Kilobytes)}`,
      `objects by kind: ${kinds || "none"}`,
    ],
  };
};
