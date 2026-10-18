import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, A1: each enemy Frostgnaw hits heals Kaeya by 15% of his ATK
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/skill.go
const COLD_BLOODED_STRIKE_ASCENSION = 1;
const COLD_BLOODED_STRIKE_ATTACK_SHARE = 0.15;

// Measured: gcsim v2.47.2 (MIT) kaeya/cons.go. Constellation 1: his normal and charged attacks crit 15% more often against
// An enemy under Cryo or Frozen. Constellation 2: each enemy defeated during Glacial Waltz extends it by 2.5 seconds, up to
// 15 seconds in all. Constellation 4: a drain that takes him under 20% HP shields him for 30% of his Max HP as Cryo, for 20
// Seconds, once every 60 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRITICAL_RATE_BONUS = 0.15;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_EXTENSION_SECONDS = 2.5;
const CONSTELLATION_2_MAX_SECONDS = 15;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "kaeya-constellation-4-cooldown";
const CONSTELLATION_4_COOLDOWN_SECONDS = 60;
const CONSTELLATION_4_HEALTH_SHARE = 0.2;
const CONSTELLATION_4_SHIELD_HEALTH_SHARE = 0.3;
const CONSTELLATION_4_SHIELD_SECONDS = 20;
const GLACIAL_WALTZ_ID = "kaeya-glacial-waltz";
// The wiki's Glacial Heart: an opponent Frozen by Frostgnaw drops an Elemental Particle, up to two each use. The
// Wiki gives no element for the particle, so it is Cryo, the element of the Frostgnaw that drops it
// https://genshin-impact.fandom.com/wiki/Kaeya
const ASCENSION_4 = 4;
const GLACIAL_HEART_HOLD_ID = "kaeya-glacial-heart";
const GLACIAL_HEART_MAX_PARTICLES = 2;

export const KAEYA_CHARACTER_ID = 10_000_015;

// Constellation 2's extension of Glacial Waltz, held so its whole lifetime from the cast stays within 15 seconds
const extendGlacialWaltz = (kitEffectState: KitEffectState, characterId: number): void => {
  const summon = findStandingKitSummon(kitEffectState.effects, GLACIAL_WALTZ_ID, characterId);
  if (!summon) return;
  const lifetimeLeftSeconds = CONSTELLATION_2_MAX_SECONDS - (summon.elapsedSeconds + summon.secondsRemaining);
  summon.secondsRemaining += Math.min(CONSTELLATION_2_EXTENSION_SECONDS, Math.max(0, lifetimeLeftSeconds));
};

// A use of Frostgnaw sets two holds of Glacial Heart, each spent by an opponent it freezes, and they run as long as the skill's
// Action does, so every hit of the use can spend one
const startGlacialHeartParticles = (kitEffectState: KitEffectState, characterId: number, seconds: number): void => {
  releaseKitHolds(kitEffectState, characterId, GLACIAL_HEART_HOLD_ID);
  for (let index = 0; index < GLACIAL_HEART_MAX_PARTICLES; index++)
    addKitHold(kitEffectState, characterId, {
      id: GLACIAL_HEART_HOLD_ID,
      maximum: GLACIAL_HEART_MAX_PARTICLES,
      seconds,
    });
};

// Spends one of the use's holds, and says whether one was left to spend
const spendGlacialHeartParticle = (kitEffectState: KitEffectState, characterId: number): boolean => {
  for (const effect of kitEffectState.effects)
    if (checkIsKitHold(effect, characterId, GLACIAL_HEART_HOLD_ID)) {
      effect.secondsRemaining = 0;
      return true;
    }
  return false;
};

// Kaeya's behaviour: Frostgnaw's hit heals him from Ascension 1, and Glacial Waltz's icicles are a summon's hits, landing
// From where he cast it and priced by him. Frostgnaw's damage against Water and Glacial Waltz's Activation knockback are
// Not built. Ascension 4 and Constellations 1, 2 and 4 are built
// Constellation 6 needs one more icicle, whose timing the record's icicle hits do not give
export const createKaeyaKitBehaviour = ({ kit, readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const icicles = readHits("icicle");
  const glacialHeartSeconds = kit.elementalSkill.seconds;
  const glacialWaltzSeconds = readSeconds("glacialWaltz");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, icicles, {
          id: GLACIAL_WALTZ_ID,
          secondsRemaining: glacialWaltzSeconds,
        }),
    },
    // Constellation 1: his normal and charged attacks crit more often against Cryo-affected enemies
    getStrikeCriticalRateBonus: ({ attackTag, combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_1 &&
      (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack) &&
      (enemy.elementalState.auras.has(AuraType.Cryo) || enemy.elementalState.auras.has(AuraType.Freeze))
        ? CONSTELLATION_1_CRITICAL_RATE_BONUS
        : 0,
    // Constellation 2: each enemy defeated during Glacial Waltz extends it
    // Constellation 4: a drain that takes him under 20% HP shields him, once every 60 seconds
    onKitEvent: (event, context, combatant) => {
      const { kitEffectState, party } = context;
      // Ascension 4: a freeze Frostgnaw makes drops a Cryo particle while its use still has one of its two to spend
      if (event.kind === KitEventKind.ReactionTriggered) {
        if (
          event.striker.characterId === combatant.characterId &&
          event.attackTag === AttackTag.ElementalSkill &&
          combatant.ascension >= ASCENSION_4 &&
          event.reactions.some(({ reactionType }) => reactionType === ReactionType.Frozen) &&
          spendGlacialHeartParticle(kitEffectState, combatant.characterId)
        )
          collectKitEnergyDrops(
            [{ count: 1, element: Element.Cryo, energyDropKind: EnergyDropKind.Particle }],
            undefined,
            context,
          );
        return;
      }
      if (event.kind === KitEventKind.EnemyDefeated) {
        if (combatant.constellationCount >= CONSTELLATION_2) extendGlacialWaltz(kitEffectState, combatant.characterId);
        return;
      }
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        combatant.constellationCount < CONSTELLATION_4 ||
        getPartyMember(party, combatant.characterId).healthShare >= CONSTELLATION_4_HEALTH_SHARE ||
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_4_COOLDOWN_ID,
          CONSTELLATION_4_COOLDOWN_SECONDS,
        )
      )
        return;
      castKitShield(kitEffectState, combatant.characterId, {
        element: Element.Cryo,
        health: CONSTELLATION_4_SHIELD_HEALTH_SHARE * combatant.attributes.maxHealth,
        secondsRemaining: CONSTELLATION_4_SHIELD_SECONDS,
      });
    },
    skill: {
      hits: [
        {
          healAttackShare: (combatant) =>
            combatant.ascension >= COLD_BLOODED_STRIKE_ASCENSION ? COLD_BLOODED_STRIKE_ATTACK_SHARE : 0,
        },
      ],
      onStart: ({ activeCombatant, kitEffectState }) => {
        if (activeCombatant.ascension >= ASCENSION_4)
          startGlacialHeartParticles(kitEffectState, activeCombatant.characterId, glacialHeartSeconds);
      },
    },
  };
};
