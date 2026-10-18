import type { Reaction } from "#src/models/combat/Reaction";
import type { GroundPoint } from "genshin-engine";

import { ReactionType } from "#src/models/combat/ReactionType";
import { applyBlessingShockwave } from "#src/services/spiralAbyss/blessings/applyBlessingShockwave";

// The seconds a Cascading shockwave waits after it fires before it may fire again
export const CASCADING_COOLDOWN_SECONDS = 4;

// The Cascading Moon's blessing, as the wiki's page for the period from 16 September 2026 gives it: a shockwave of True DMG at an
// Opponent's position when a character deals Swirl DMG to it, at most once every four seconds. The Stellar Swirl the page also
// Names is not a reaction the engine holds, so it does not trigger it. As with Stardread, this decides when the shockwave fires and
// Where, not what it deals. It returns the seconds the next shockwave may fire from, and the position of the one that fired, if one did
export const applyCascadingShockwave = (
  readySeconds: number,
  reactions: readonly Reaction[],
  position: GroundPoint,
  seconds: number,
): { readySeconds: number; shockwavePosition?: GroundPoint } => {
  const isTriggered = reactions.some(({ reactionType }) => reactionType === ReactionType.Swirl);
  return applyBlessingShockwave(readySeconds, isTriggered, position, seconds, CASCADING_COOLDOWN_SECONDS);
};
