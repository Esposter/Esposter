import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
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

export const KAEYA_CHARACTER_ID = 10_000_015;

// Constellation 2's extension of Glacial Waltz, held so its whole lifetime from the cast stays within 15 seconds
const extendGlacialWaltz = (kitEffectState: KitEffectState, characterId: number): void => {
  const summon = findStandingKitSummon(kitEffectState.effects, GLACIAL_WALTZ_ID, characterId);
  if (!summon) return;
  const lifetimeLeftSeconds = CONSTELLATION_2_MAX_SECONDS - (summon.elapsedSeconds + summon.secondsRemaining);
  summon.secondsRemaining += Math.min(CONSTELLATION_2_EXTENSION_SECONDS, Math.max(0, lifetimeLeftSeconds));
};

// Kaeya's behaviour: Frostgnaw's hit heals him from Ascension 1, and Glacial Waltz's icicles are a summon's hits, landing
// From where he cast it and priced by him. Frostgnaw's damage against Water, A4's particles and Glacial Waltz's
// Activation knockback are not built. Constellations 1, 2 and 4 are built
// Constellation 6 needs one more icicle, whose timing the record's icicle hits do not give
export const createKaeyaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const icicles = readHits("icicle");
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
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
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
    },
  };
};
