import type { GenshinChange } from "#src/models/genshinProgress/GenshinChange";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";

import { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";
import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";
import { getNeedsState } from "#src/services/genshinProgress/getNeedsState";

// A change as units: each open task counts once in the phase its own task holds, in the state its change's needs and
// Blocker give, and a change with no open task counts once as done in the phase it holds
export const getChangeUnits = (
  { needs, phase, tasks, waiting }: GenshinChange,
  capabilities: readonly string[],
): GenshinUnit[] => {
  const openTasks = tasks.filter(({ isDone }) => !isDone);
  if (openTasks.length === 0)
    return [{ blocker: "", kind: GenshinProgressKind.Change, phase, state: GenshinUnitState.Done }];
  const state = getNeedsState(needs, waiting, capabilities);
  return openTasks.map((task) => ({ blocker: waiting, kind: GenshinProgressKind.Change, phase: task.phase, state }));
};
