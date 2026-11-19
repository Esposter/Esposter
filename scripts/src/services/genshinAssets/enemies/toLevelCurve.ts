import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One curve's multiplier at each level, from level one, read off the game's monster curve table. The table's levels run
// From one without a gap, so a level's multiplier sits at its index. The caller sorts the rows by level once
export const toLevelCurve = (monsterCurveRows: readonly MonsterCurveRow[], curve: string): number[] =>
  monsterCurveRows.map(({ curveInfos, level }) => {
    const value = curveInfos.find(({ type }) => type === curve)?.GGKIEIJLCJJ;
    if (value === undefined) throw new InvalidOperationError(Operation.Read, curve, `has no level ${level}`);
    return value;
  });
