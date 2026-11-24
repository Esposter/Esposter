import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Every curve's multiplier at each level, read once off the game's monster curve table and keyed by the curve's name.
// The caller sorts the rows by level, so a level's multiplier sits at its index, and a build reads each curve from this
// Index rather than scanning the table for every enemy
export const toLevelCurves = (monsterCurveRows: readonly MonsterCurveRow[]): Map<string, number[]> => {
  const curves = new Set(monsterCurveRows.flatMap(({ curveInfos }) => curveInfos.map(({ type }) => type)));
  return new Map(
    Array.from(curves, (curve) => [
      curve,
      monsterCurveRows.map(({ curveInfos, level }) => {
        const value = curveInfos.find(({ type }) => type === curve)?.GGKIEIJLCJJ;
        if (value === undefined) throw new InvalidOperationError(Operation.Read, curve, `has no level ${level}`);
        return value;
      }),
    ]),
  );
};
