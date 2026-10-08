import type { ExcelCurveRow } from "#src/models/genshinAssets/stats/ExcelCurveRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The curves named, each as its multiplier at every level the table runs to, from level 1
export const toGrowCurves = (rows: readonly ExcelCurveRow[], curves: ReadonlySet<string>): Record<string, number[]> => {
  const sortedRows = rows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  return Object.fromEntries(
    Array.from(curves, (curve) => [
      curve,
      sortedRows.map(({ curveInfos, level }) => {
        const multiplier = curveInfos.find(({ type }) => type === curve)?.value;
        if (multiplier === undefined)
          throw new InvalidOperationError(Operation.Read, curve, `no multiplier at level ${level}`);
        return multiplier;
      }),
    ]),
  );
};
