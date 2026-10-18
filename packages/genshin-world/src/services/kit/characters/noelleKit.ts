import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Breastplate's constellations, gated on the level the save holds: I Got Your Back at 1 makes its heal certain while
// Sweeping Time is up, and To Be Cleaned at 4 explodes the shield as it ends
// https://genshin-impact.fandom.com/wiki/I_Got_Your_Back and https://genshin-impact.fandom.com/wiki/To_Be_Cleaned
const I_GOT_YOUR_BACK_CONSTELLATION = 1;
const TO_BE_CLEANED_CONSTELLATION = 4;
// Combat Maid, from Constellation 2: her Charged Attacks cost a fifth less stamina and deal 15% more DMG
const COMBAT_MAID_CONSTELLATION = 2;
const COMBAT_MAID_CHARGED_ATTACK_STAMINA_MULTIPLIER = 0.8;
const COMBAT_MAID_CHARGED_ATTACK_DAMAGE_BONUS = 0.15;

// Devotion, from Ascension 1, shields the active character with 4 times Noelle's DEF for 20 seconds when a drain takes it
// Under 30% HP, once every 60 seconds, as gcsim v2.47.2 (MIT) noelle/asc.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/noelle/asc.go
const DEVOTION_ASCENSION = 1;
const DEVOTION_HEALTH_SHARE = 0.3;
const DEVOTION_DEFENSE_MULTIPLIER = 4;
const DEVOTION_SECONDS = 20;
const DEVOTION_COOLDOWN_SECONDS = 60;
const DEVOTION_COOLDOWN_STATUS_ID = "noelle-devotion-cooldown";

// From Ascension 4, each fourth normal attack or charged attack that strikes an enemy cuts the skill's cooldown by a second,
// Counting each attack once on the first enemy it strikes, and a skill restarts the count, as gcsim's makeA4CB does
const ASCENSION_4 = 4;
const ASCENSION_4_ATTACK_COUNT = 4;
const ASCENSION_4_SKILL_COOLDOWN_REDUCTION_SECONDS = 1;
const ASCENSION_4_COUNT_STATUS_ID = "noelle-ascension-4-count";

export const NOELLE_CHARACTER_ID = 10_000_034;

// Noelle's behaviour: Breastplate's heal on a hit of her attacks and her press while the shield stands rolls at the
// Table's chance, certain from one constellation under Sweeping Time. Breastplate shields her from her DEF for the
// Table's seconds, exploding as it ends from four constellations, and Sweeping Time adds a share of her DEF to her ATK
// Constellation 6 needs an enemy-defeated event for Sweeping Time's extra seconds, which the kit does not read
// And converts her attacks to Geo for the table's seconds past its start. Ascension 1's Devotion shield and Ascension 4's
// Skill cooldown cut are built. The charged attack is one cycle of its spin and its final slash
// The count an attack adds to Ascension 4's, which a fourth one spends on the skill's cooldown
const countAttack = ({ kitEffectState, party }: KitContext, characterId: number): void => {
  const stacks = (findKitStatus(kitEffectState.effects, characterId, ASCENSION_4_COUNT_STATUS_ID)?.stacks ?? 0) + 1;
  if (stacks < ASCENSION_4_ATTACK_COUNT) {
    addKitStatus(kitEffectState, characterId, {
      id: ASCENSION_4_COUNT_STATUS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks,
    });
    return;
  }
  addKitStatus(kitEffectState, characterId, {
    id: ASCENSION_4_COUNT_STATUS_ID,
    secondsRemaining: Number.POSITIVE_INFINITY,
    stacks: 0,
  });
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.skillCooldownSeconds > 0)
    partyMember.skillCooldownSeconds = Math.max(
      0,
      partyMember.skillCooldownSeconds - ASCENSION_4_SKILL_COOLDOWN_REDUCTION_SECONDS,
    );
};

// An attack's hits, each counting once toward Ascension 4 on the first enemy it strikes, which the attack's start clears
const createCountedAttack = (healBehaviour: KitHitBehaviour, hitCount: number): KitActionBehaviour => {
  const hasCountedList = Array.from({ length: hitCount }, () => false);
  return {
    hits: hasCountedList.map((_hasCounted, index): KitHitBehaviour => ({
      ...healBehaviour,
      onStrike: (context, { combatant }) => {
        if (combatant.ascension < ASCENSION_4 || hasCountedList[index]) return;
        hasCountedList[index] = true;
        countAttack(context, combatant.characterId);
      },
    })),
    onStart: () => hasCountedList.fill(false),
  };
};

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
    chargedAttack: createCountedAttack(breastplateHealBehaviour, kit.chargedAttack.hits.length),
    normalAttacks: kit.normalAttacks.map(({ hits }) => createCountedAttack(breastplateHealBehaviour, hits.length)),
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      // A drain by a kit, unlike an enemy's strike, names its source, as Devotion's drain does
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.healthShare >= 0 ||
        event.sourceCharacterId === undefined ||
        combatant.ascension < DEVOTION_ASCENSION ||
        getPartyMember(party, activeCombatant.characterId).healthShare >= DEVOTION_HEALTH_SHARE
      )
        return;
      if (
        !startKitCooldown(kitEffectState, combatant.characterId, DEVOTION_COOLDOWN_STATUS_ID, DEVOTION_COOLDOWN_SECONDS)
      )
        return;
      castKitShield(kitEffectState, combatant.characterId, {
        element: Element.Cryo,
        health: DEVOTION_DEFENSE_MULTIPLIER * combatant.attributes.defense,
        secondsRemaining: DEVOTION_SECONDS,
      });
    },
    // Combat Maid's stamina cut and DMG bonus on her Charged Attacks, from Constellation 2
    getChargedAttackStaminaMultiplier: ({ activeCombatant: combatant }) =>
      combatant.constellationCount >= COMBAT_MAID_CONSTELLATION ? COMBAT_MAID_CHARGED_ATTACK_STAMINA_MULTIPLIER : 1,
    getStrikeDamageBonus: ({ attackTag, combatant }) =>
      combatant.constellationCount >= COMBAT_MAID_CONSTELLATION && attackTag === AttackTag.ChargedAttack
        ? COMBAT_MAID_CHARGED_ATTACK_DAMAGE_BONUS
        : 0,
    skill: {
      hits: [breastplateHealBehaviour],
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        // A skill restarts Ascension 4's count, as gcsim's skill does
        if (combatant.ascension >= ASCENSION_4)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: ASCENSION_4_COUNT_STATUS_ID,
            secondsRemaining: Number.POSITIVE_INFINITY,
            stacks: 0,
          });
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Geo,
          // To Be Cleaned's explosion is priced by Noelle as she stood when she cast the shield, and lands on the character
          // On the field as the shield ends, whoever holds it then
          ...(combatant.constellationCount >= TO_BE_CLEANED_CONSTELLATION && {
            explosion: { combatant, hit: toBeCleanedHit },
          }),
          health: shieldFlatHealth + shieldDefenseShare * combatant.attributes.defense,
          secondsRemaining: shieldSeconds,
        });
      },
    },
  };
};
