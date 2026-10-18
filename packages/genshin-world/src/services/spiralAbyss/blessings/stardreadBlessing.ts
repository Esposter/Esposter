import type { Reaction } from "#src/models/combat/Reaction";
import type { GroundPoint } from "genshin-engine";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { applyBlessingShockwave } from "#src/services/spiralAbyss/blessings/applyBlessingShockwave";

// The seconds a Stardread shockwave waits after it fires before it may fire again
export const STARDREAD_COOLDOWN_SECONDS = 2;

// The name text hash of the blessing the period from 16 October 2026 gives, the Stardread Moon, which picks this module
export const STARDREAD_NAME_TEXT_HASH = 1867767671;

// https://genshin-impact.fandom.com/wiki/Spiral_Abyss/Blessing_of_the_Abyssal_Moon/2026-10-16
// The Stardread Moon's blessing, as the wiki's page for the period from 16 October 2026 gives it: a shockwave of True DMG at an
// Opponent's position when a character triggers Superconduct, Cryo Swirl, Frozen or Shatter on it, at most once every two
// Seconds. The Stellar-Conduct and Stellar Swirl the page also names are not reactions the engine holds, so they do not trigger
// It, and the shockwave's damage is in no source read, so this decides when the shockwave fires and where, not what it deals.
// It returns the seconds the next shockwave may fire from, and the position of the one that fired, if one did
export const applyStardreadShockwave = (
  readySeconds: number,
  reactions: readonly Reaction[],
  position: GroundPoint,
  seconds: number,
): { readySeconds: number; shockwavePosition?: GroundPoint } => {
  const isTriggered = reactions.some(
    ({ element, reactionType }) =>
      reactionType === ReactionType.Superconduct ||
      reactionType === ReactionType.Frozen ||
      reactionType === ReactionType.Shattered ||
      (reactionType === ReactionType.Swirl && element === Element.Cryo),
  );
  return applyBlessingShockwave(readySeconds, isTriggered, position, seconds, STARDREAD_COOLDOWN_SECONDS);
};
