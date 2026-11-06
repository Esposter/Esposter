import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";

// Each open quest of a phase as one check line named by its id: scripted when a session script names it, else not
// Measurable. A ticked quest is done and has no line, and a unit that names no quest is none of these
export const getQuestChecks = (units: readonly GenshinUnit[]): GenshinExitCheck[] =>
  units.flatMap(({ quest, state }) => {
    if (quest === undefined || state === GenshinUnitState.Done) return [];
    const checkState =
      state === GenshinUnitState.Scripted ? GenshinExitCheckState.Scripted : GenshinExitCheckState.NotMeasurable;
    return [{ name: `quest ${quest}`, notes: [], state: checkState }];
  });
