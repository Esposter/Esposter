import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

// Guardian's Oath: every summon on the field, on both sides, is destroyed
export const guardiansOath: GcgCardModule = {
  play: ({ duel }) => {
    for (const side of duel.sides) side.summons = [];
  },
};
