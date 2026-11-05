import { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";
import { checkNeedsMet } from "#src/services/genshinProgress/checkNeedsMet";

// The state a unit holds from its needs and its blocker: waiting while a blocker is named, runnable when this machine meets
// Its needs, and blocked on the other machine otherwise
export const getNeedsState = (
  needs: readonly string[],
  blocker: string,
  capabilities: readonly string[],
): GenshinUnitState => {
  if (blocker !== "") return GenshinUnitState.Waiting;
  if (checkNeedsMet(needs, capabilities)) return GenshinUnitState.Runnable;
  return GenshinUnitState.Blocked;
};
