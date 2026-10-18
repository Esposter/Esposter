import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";

// Breastplate's constellations, gated on the level the save holds: I Got Your Back at 1 makes its heal certain while
// Sweeping Time is up, and To Be Cleaned at 4 explodes the shield as it ends
// https://genshin-impact.fandom.com/wiki/I_Got_Your_Back and https://genshin-impact.fandom.com/wiki/To_Be_Cleaned
const I_GOT_YOUR_BACK_CONSTELLATION = 1;
const TO_BE_CLEANED_CONSTELLATION = 4;
// Combat Maid, from Constellation 2: her Charged Attacks cost a fifth less stamina and deal 15% more DMG
const COMBAT_MAID_CONSTELLATION = 2;
const COMBAT_MAID_CHARGED_ATTACK_STAMINA_MULTIPLIER = 0.8;
const COMBAT_MAID_CHARGED_ATTACK_DAMAGE_BONUS = 0.15;

export const NOELLE_CHARACTER_ID = 10_000_034;

// Noelle's behaviour: Breastplate's heal on a hit of her attacks and her press while the shield stands rolls at the
// Table's chance, certain from one constellation under Sweeping Time. Breastplate shields her from her DEF for the
// Table's seconds, exploding as it ends from four constellations, and Sweeping Time adds a share of her DEF to her ATK
// And converts her attacks to Geo for the table's seconds past its start. A1's and A4's effects, and Constellation 6's
// Extra seconds, are not built, so the
// Charged attack is one cycle of its spin and its final slash
// Constellation 6 needs an enemy-defeated event for Sweeping Time's extra seconds, which the kit does not read
export const createNoelleKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const breastplateHealChance = readParameter("breastplateHealChance");
  const shieldFlatHealth = readParameter("breastplateShieldFlatHealth");
  const shieldDefenseShare = readParameter("breastplateShieldDefenseShare");
  const shieldSeconds = readParameter("breastplateShieldSeconds");
  const sweepingTimeSeconds = readParameter("sweepingTimeSeconds") + readSeconds("sweepingTimeStart");
  const sweepingTimeDefenseShare = readParameter("sweepingTimeAttackDefenseShare");
  const toBeCleanedHit = readHit("toBeCleaned");
  // Sweeping Time's Geo infusion is up on Noelle while her burst's effects stand, which I Got Your Back's chance reads
  const breastplateHealBehaviour: KitHitBehaviour = {
    healPartyChance: (striker, effects) =>
      striker.constellationCount >= I_GOT_YOUR_BACK_CONSTELLATION &&
      effects.some(
        (effect) =>
          effect.kind === "infusion" && effect.characterId === striker.characterId && effect.element === Element.Geo,
      )
        ? 1
        : breastplateHealChance,
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: sweepingTimeDefenseShare * combatant.attributes.defense,
          attribute: Attribute.Attack,
          secondsRemaining: sweepingTimeSeconds,
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Geo,
          isConverted: true,
          kind: "infusion",
          secondsRemaining: sweepingTimeSeconds,
        });
      },
    },
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => breastplateHealBehaviour) },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => breastplateHealBehaviour) })),
    // Combat Maid's stamina cut and DMG bonus on her Charged Attacks, from Constellation 2
    getChargedAttackStaminaMultiplier: ({ activeCombatant: combatant }) =>
      combatant.constellationCount >= COMBAT_MAID_CONSTELLATION ? COMBAT_MAID_CHARGED_ATTACK_STAMINA_MULTIPLIER : 1,
    getStrikeDamageBonus: ({ attackTag, combatant }) =>
      combatant.constellationCount >= COMBAT_MAID_CONSTELLATION && attackTag === AttackTag.ChargedAttack
        ? COMBAT_MAID_CHARGED_ATTACK_DAMAGE_BONUS
        : 0,
    skill: {
      hits: [breastplateHealBehaviour],
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Geo,
          // To Be Cleaned's explosion is priced by Noelle as she stood when she cast the shield, and lands on the character
          // On the field as the shield ends, whoever holds it then
          ...(combatant.constellationCount >= TO_BE_CLEANED_CONSTELLATION && {
            explosion: { combatant, hit: toBeCleanedHit },
          }),
          health: shieldFlatHealth + shieldDefenseShare * combatant.attributes.defense,
          secondsRemaining: shieldSeconds,
        }),
    },
  };
};
