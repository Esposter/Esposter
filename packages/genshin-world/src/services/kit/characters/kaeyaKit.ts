import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, A1: each enemy Frostgnaw hits heals Kaeya by 15% of his ATK
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/skill.go
const COLD_BLOODED_STRIKE_ASCENSION = 1;
const COLD_BLOODED_STRIKE_ATTACK_SHARE = 0.15;

// Measured: gcsim v2.47.2 (MIT) kaeya/cons.go. Constellation 1: his normal and charged attacks crit 15% more often against
// An enemy under Cryo or Frozen. Constellation 4: a drain that takes him under 20% HP shields him for 30% of his Max HP as
// Cryo, for 20 seconds, once every 60 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRITICAL_RATE_BONUS = 0.15;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "kaeya-constellation-4-cooldown";
const CONSTELLATION_4_COOLDOWN_SECONDS = 60;
const CONSTELLATION_4_HEALTH_SHARE = 0.2;
const CONSTELLATION_4_SHIELD_HEALTH_SHARE = 0.3;
const CONSTELLATION_4_SHIELD_SECONDS = 20;

export const KAEYA_CHARACTER_ID = 10_000_015;

// Kaeya's behaviour: Frostgnaw's hit heals him from Ascension 1, and Glacial Waltz's icicles are a summon's hits, landing
// From where he cast it and priced by him. Frostgnaw's damage against Water, A4's particles and Glacial Waltz's
// Activation knockback are not built. Constellations 1 and 4 are built
// Constellation 2 needs each enemy defeated during Glacial Waltz, which waits on the enemy-defeated event no kit reports yet
// Constellation 6 needs one more icicle, whose timing the record's icicle hits do not give, and 15 Energy on Glacial Waltz's
// Cast, which waits on energy regeneration
export const createKaeyaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const icicles = readHits("icicle");
  const glacialWaltzSeconds = readSeconds("glacialWaltz");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, icicles, { secondsRemaining: glacialWaltzSeconds }),
    },
    // Constellation 1: his normal and charged attacks crit more often against Cryo-affected enemies
    getStrikeCriticalRateBonus: ({ attackTag, combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_1 &&
      (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack) &&
      (enemy.elementalState.auras.has(AuraType.Cryo) || enemy.elementalState.auras.has(AuraType.Freeze))
        ? CONSTELLATION_1_CRITICAL_RATE_BONUS
        : 0,
    // Constellation 4: a drain that takes him under 20% HP shields him, once every 60 seconds
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
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
