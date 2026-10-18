import type { GroundPoint } from "genshin-engine";

// A shockwave a period's blessing fires at an opponent's position when its reaction triggers it, at most once every cooldown:
// It fires when triggered and the seconds have reached the ready seconds, and the next one is ready a cooldown after it. It
// Returns the seconds the next shockwave may fire from, and the position of the one that fired, if one did
export const applyBlessingShockwave = (
  readySeconds: number,
  isTriggered: boolean,
  position: GroundPoint,
  seconds: number,
  cooldownSeconds: number,
): { readySeconds: number; shockwavePosition?: GroundPoint } => {
  if (!isTriggered || seconds < readySeconds) return { readySeconds };
  return { readySeconds: seconds + cooldownSeconds, shockwavePosition: position };
};
