import type { KitEffect } from "#src/models/kit/KitEffect";

// The ratio the team's anti-colds hold the Sheer Cold fill down by, summed, and none while the team holds none
export const getTeamAntiColdRatio = (effects: readonly KitEffect[]): number =>
  effects.reduce((ratio, effect) => (effect.kind === "antiCold" ? ratio + effect.ratio : ratio), 0);
