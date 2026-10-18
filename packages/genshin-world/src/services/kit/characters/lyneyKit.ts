import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { countDeployedElements } from "#src/services/party/countDeployedElements";

export const LYNEY_CHARACTER_ID = 10_000_084;

const CONSTELLATION_4 = 4;
const CONSTELLATION_4_PYRO_RESISTANCE_REDUCTION = 0.2;
const CONSTELLATION_4_SECONDS = 6;
const CONSTELLATION_4_STATUS_ID = "lyney-c4-pyro-resistance";
// Measured: gcsim (MIT, main) lyney/asc.go, Ascension 4's DMG bonus on an enemy affected by Pyro: 60%, and 20% more for each
// Other Pyro member of the team, up to 100%
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lyney/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_DAMAGE_BONUS = 0.6;
const ASCENSION_4_DAMAGE_BONUS_PER_OTHER_PYRO = 0.2;
const ASCENSION_4_DAMAGE_BONUS_CAP = 1;

// The DMG bonus Ascension 4 adds to a strike of his that lands on an enemy affected by Pyro, a Burning enemy included
const getAscension4DamageBonus = (combatant: Combatant, enemy: Enemy): number => {
  if (combatant.ascension < ASCENSION_4) return 0;
  const { auras } = enemy.elementalState;
  if (!auras.has(AuraType.Pyro) && !auras.has(AuraType.Burning)) return 0;
  const otherPyroCount = Math.max(countDeployedElements(combatant.deployedElements, [Element.Pyro]) - 1, 0);
  return Math.min(
    ASCENSION_4_DAMAGE_BONUS + otherPyroCount * ASCENSION_4_DAMAGE_BONUS_PER_OTHER_PYRO,
    ASCENSION_4_DAMAGE_BONUS_CAP,
  );
};

// Lyney's behaviour: the Prop Arrow, the charged attack a full hold takes, and Wondrous Trick: Miracle Parade each cast a
// Grin-Malkin Hat as they start, a summon where he stands whose Pyrotechnic Strike lands on its own clock as the hat
// Expires. The tap-released Physical aimed shot and the Pyro shot at a partial hold, Bewildering Lights' Prop Surplus
// Bonus, its heal and the hats it explodes, Miracle Parade's ticks, and his Ascension 1 passive and Constellations 1 and 6 are not built
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
    getStrikeDamageBonus: ({ combatant }, enemy) => getAscension4DamageBonus(combatant, enemy),
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
