import type { Reaction } from "#src/models/combat/Reaction";
import type { AbyssBlessingState } from "#src/models/spiralAbyss/AbyssBlessingState";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";
import type { GroundPoint } from "genshin-engine";

import {
  applyStardreadShockwave,
  STARDREAD_NAME_TEXT_HASH,
} from "#src/services/spiralAbyss/blessings/stardreadBlessing";

// A reaction the world triggers on an enemy, handed to the module of the period blessing the chamber is in. A blessing without a
// Module, or a chamber with none, leaves the state as it was
export const applyAbyssBlessingReaction = (
  blessing: AbyssPeriodBlessing | undefined,
  state: AbyssBlessingState,
  position: GroundPoint,
  reactions: readonly Reaction[],
  seconds: number,
): AbyssBlessingState => {
  if (blessing?.nameTextHash !== STARDREAD_NAME_TEXT_HASH) return state;
  const { readySeconds, shockwavePosition } = applyStardreadShockwave(
    state.blessingReadySecondsMap.get(STARDREAD_NAME_TEXT_HASH) ?? 0,
    reactions,
    position,
    seconds,
  );
  return {
    blessingReadySecondsMap: new Map(state.blessingReadySecondsMap).set(STARDREAD_NAME_TEXT_HASH, readySeconds),
    shockwavePositions: shockwavePosition ? [...state.shockwavePositions, shockwavePosition] : state.shockwavePositions,
  };
};
