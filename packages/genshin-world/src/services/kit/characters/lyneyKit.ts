import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const LYNEY_CHARACTER_ID = 10_000_084;

// Lyney's behaviour: the Prop Arrow, the charged attack a full hold takes, and Wondrous Trick: Miracle Parade each cast a
// Grin-Malkin Hat as they start, a summon where he stands whose Pyrotechnic Strike lands on its own clock as the hat
// Expires. The tap-released Physical aimed shot and the Pyro shot at a partial hold, Bewildering Lights' Prop Surplus
// Bonus, its heal and the hats it explodes, Miracle Parade's ticks, and his passives and constellations are not built
export const createLyneyKitBehaviour = ({ readHitFields, readSeconds }: KitRecordReader): KitBehaviour => {
  const pyrotechnicStrikeFields = readHitFields("pyrotechnicStrike");
  // The record's fields hold every field of the Pyrotechnic Strike but its hitmark, which their partial type cannot show
  const propArrowPyrotechnicStrike = {
    ...pyrotechnicStrikeFields,
    hitmarkSeconds: readSeconds("propArrowPyrotechnicStrikeHitmark"),
  } as KitHit;
  const miracleParadePyrotechnicStrike = {
    ...pyrotechnicStrikeFields,
    hitmarkSeconds: readSeconds("miracleParadePyrotechnicStrikeHitmark"),
  } as KitHit;
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [miracleParadePyrotechnicStrike]),
    },
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [propArrowPyrotechnicStrike]),
    },
  };
};
