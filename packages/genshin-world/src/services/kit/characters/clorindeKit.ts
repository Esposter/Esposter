import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";

export const CLORINDE_CHARACTER_ID = 10_000_098;

// Constellation 6, "And So Shall I Never Despair": for 12 seconds after Hunter's Vigil is used, her CRIT Rate rises by 10% and
// Her CRIT DMG by 70%, as the wiki's constellation page gives it
const CONSTELLATION_6 = 6;
const HUNTERS_VIGIL_CRIT_DAMAGE = 0.7;
const HUNTERS_VIGIL_CRIT_RATE = 0.1;
const HUNTERS_VIGIL_CRIT_SECONDS = 12;

// Night Vigil's Bond of Life thresholds, as gcsim v2.47.2 (MIT) clorinde/skill.go and attack.go read her HP debt ratio: a
// Full share is 100%, and Impale the Night takes its no-share variant within gcsim's tolerance of zero
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/clorinde/skill.go
const BOND_OF_LIFE_FULL_SHARE = 1;
const BOND_OF_LIFE_TOLERANCE = 0.0000001;

// Clorinde's behaviour: Hunter's Vigil's press starts Night Vigil for its table's seconds, ending as she leaves the field,
// And its Constellation 6 buffs her CRIT. Night Vigil's Swift Hunt steps cast their entry of the piercing shot below a
// Full Bond of Life share, which gains Bond of Life as it strikes, and of the normal shot otherwise, and its Impale the
// Night press casts the variant the share picks, each where her body stands, and the low and full ones heal her by the
// Share they clear of her Bond of Life. Not built: Last Lightfall's Bond of Life, her passives, Constellations 1, 2, 4
export const createClorindeKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const nightVigilSeconds = readParameter("nightVigilSeconds");
  const swiftHuntBondOfLifeGain = readParameter("swiftHuntBondOfLifeGain");
  const swiftHuntNormalShots = readHits("swiftHuntNormalShot");
  const swiftHuntPiercingShots = readHits("swiftHuntPiercingShot", {
    onStrike: (context, strike) => {
      grantPartyMemberBondOfLife(context.party, strike.combatant.characterId, swiftHuntBondOfLifeGain);
    },
  });
  const impaleTheNightFullHits = readHits("impaleTheNightFullBondOfLife");
  const impaleTheNightLowHit = readHit("impaleTheNightLowBondOfLife");
  const impaleTheNightNoHit = readHit("impaleTheNightNoBondOfLife");
  const impaleTheNightFullHealing = readParameter("impaleTheNightFullBondOfLifeHealing");
  const impaleTheNightLowHealing = readParameter("impaleTheNightLowBondOfLifeHealing");
  // Swift Hunt's step casts its own entry of the list its share picks, the step's index in each list
  const swiftHuntStep = (index: number): KitActionBehaviour => ({
    onStart: ({ activeCombatant, body, kitEffectState, party }) => {
      const isPiercing = getPartyMember(party, activeCombatant.characterId).bondOfLifeShare < BOND_OF_LIFE_FULL_SHARE;
      const hit = (isPiercing ? swiftHuntPiercingShots : swiftHuntNormalShots).at(index);
      if (hit !== undefined)
        castKitSummon(kitEffectState, body, activeCombatant, [hit], { attackTag: AttackTag.NormalAttack });
    },
  });
  // Impale the Night's variant: the full one at a full share, its no-share one at none, and the low one between.
  // The low and full ones clear the Bond of Life she carries and heal her by the share times their healing.
  // As gcsim's skillHeal does, the Bond takes that heal before her HP does.
  // The heal lands at the press, where gcsim queues its full heal six frames later.
  const impaleTheNight = (context: KitContext): void => {
    const { activeCombatant, body, characterIdCombatantMap, kitEffectState, party } = context;
    const { bondOfLifeShare } = getPartyMember(party, activeCombatant.characterId);
    if (Math.abs(bondOfLifeShare) < BOND_OF_LIFE_TOLERANCE) {
      castKitSummon(kitEffectState, body, activeCombatant, [impaleTheNightNoHit], {
        attackTag: AttackTag.NormalAttack,
      });
      return;
    }
    const isFull = bondOfLifeShare >= BOND_OF_LIFE_FULL_SHARE;
    castKitSummon(kitEffectState, body, activeCombatant, isFull ? impaleTheNightFullHits : [impaleTheNightLowHit], {
      attackTag: AttackTag.NormalAttack,
    });
    changeKitMemberHealth(
      context,
      activeCombatant,
      activeCombatant.characterId,
      bondOfLifeShare *
        (isFull ? impaleTheNightFullHealing : impaleTheNightLowHealing) *
        getKitMaxHealth(activeCombatant, kitEffectState.effects, party, characterIdCombatantMap),
    );
  };
  const nightVigil = readStance("nightVigil", {
    normalAttacks: [swiftHuntStep(0), swiftHuntStep(1), swiftHuntStep(2)],
    skill: { onStart: impaleTheNight },
  });
  return {
    skill: {
      onStart: (context) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        if (combatant.constellationCount >= CONSTELLATION_6) {
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: HUNTERS_VIGIL_CRIT_RATE,
            attribute: Attribute.CriticalRate,
            secondsRemaining: HUNTERS_VIGIL_CRIT_SECONDS,
          });
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: HUNTERS_VIGIL_CRIT_DAMAGE,
            attribute: Attribute.CriticalDamage,
            secondsRemaining: HUNTERS_VIGIL_CRIT_SECONDS,
          });
        }
        enterKitStance(kitEffectState, combatant, nightVigil, nightVigilSeconds, { isEndedOnSwap: true });
      },
    },
  };
};
