import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const KAVEH_CHARACTER_ID = 10_000_081;

// Kaveh's behaviour: Painted Dome's stance widens his strikes for its twelve seconds, which the kit starts with the
// Animation rather than at the hit, and plays the rest of his kit as it stands. The Dendro Cores his skill and burst
// Rupture, Painted Dome's Bloom DMG Bonus and his passives are not built yet
export const createKavehKitBehaviour = ({ readSeconds, readStance }: KitRecordReader): KitBehaviour => {
  // The widened strikes stay Normal Attack DMG, gcsim's AttackTagNormal in kaveh/attack.go's Attack
  const paintedDome = readStance("paintedDome");
  const paintedDomeSeconds = readSeconds("paintedDome");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, paintedDome, paintedDomeSeconds, { isEndedOnSwap: true }),
    },
  };
};
