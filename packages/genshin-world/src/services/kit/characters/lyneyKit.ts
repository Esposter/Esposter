import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const LYNEY_CHARACTER_ID = 10_000_084;

const CONSTELLATION_4 = 4;
const CONSTELLATION_4_PYRO_RESISTANCE_REDUCTION = 0.2;
const CONSTELLATION_4_SECONDS = 6;
const CONSTELLATION_4_STATUS_ID = "lyney-c4-pyro-resistance";

// Lyney's behaviour: the Prop Arrow, the charged attack a full hold takes, and Wondrous Trick: Miracle Parade each cast a
// Grin-Malkin Hat as they start, a summon where he stands whose Pyrotechnic Strike lands on its own clock as the hat
// Expires. The tap-released Physical aimed shot and the Pyro shot at a partial hold, Bewildering Lights' Prop Surplus
// Bonus, its heal and the hats it explodes, Miracle Parade's ticks, and his passives and Constellations 1 and 6 are not built
// Constellation 1 needs Prop Surplus stacks, which the kit does not build, and the hat Prop Arrows add
// Constellation 6 needs the Reprised Pyrotechnic Strike's own hitmark, which the kit does not read
// Constellation 2 needs Crisp Focus's stack every 2 seconds on the field, which the kit's timers do not build
export const createLyneyKitBehaviour = ({ readHitFields, readSeconds }: KitRecordReader): KitBehaviour => {
  const pyrotechnicStrikeFields = readHitFields("pyrotechnicStrike", ["hitmarkSeconds"]);
  // The Pyro RES the Prop Arrow's strike cuts from the enemy it hits, from Constellation 4, for its seconds
  const pyroResistanceReduction: EnemyStatus = {
    damageTakenBonus: 0,
    id: CONSTELLATION_4_STATUS_ID,
    resistanceReduction: { [Element.Pyro]: CONSTELLATION_4_PYRO_RESISTANCE_REDUCTION },
    secondsRemaining: CONSTELLATION_4_SECONDS,
  };
  const propArrowPyrotechnicStrike: KitHit = {
    ...pyrotechnicStrikeFields,
    enemyStatus: (combatant) => (combatant.constellationCount >= CONSTELLATION_4 ? pyroResistanceReduction : undefined),
    hitmarkSeconds: readSeconds("propArrowPyrotechnicStrikeHitmark"),
  };
  const miracleParadePyrotechnicStrike: KitHit = {
    ...pyrotechnicStrikeFields,
    hitmarkSeconds: readSeconds("miracleParadePyrotechnicStrikeHitmark"),
  };
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
