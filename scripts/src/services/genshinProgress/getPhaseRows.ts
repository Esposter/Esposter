import type { GenshinProgressRow } from "#src/models/genshinProgress/GenshinProgressRow";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";
import { GENSHIN_ROW_KINDS } from "#src/services/genshinProgress/constants";

// One phase's rows: one per kind it holds, in the report's order, each counting its units by state and naming the first
// Blocker of its waiting units
export const getPhaseRows = (units: readonly GenshinUnit[]): GenshinProgressRow[] =>
  GENSHIN_ROW_KINDS.filter((kind) => units.some((unit) => unit.kind === kind)).map((kind) => {
    const kindUnits = units.filter((unit) => unit.kind === kind);
    const countState = (state: GenshinUnitState) => kindUnits.filter((unit) => unit.state === state).length;
    return {
      blocked: countState(GenshinUnitState.Blocked),
      done: countState(GenshinUnitState.Done),
      firstBlocker: kindUnits.find((unit) => unit.state === GenshinUnitState.Waiting)?.blocker ?? "",
      kind,
      notMeasurable: countState(GenshinUnitState.NotMeasurable),
      runnable: countState(GenshinUnitState.Runnable),
      scripted: countState(GenshinUnitState.Scripted),
      units: kindUnits.length,
      waiting: countState(GenshinUnitState.Waiting),
    };
  });
