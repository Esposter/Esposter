import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

// Ryuukin Saxifrage's first enemy struck carries Aurous Blaze, as gcsim v2.47.2 (MIT) yoimiya/burst.go marks it, while
// The burst is pending, and the explosion's internal cooldown is a status of its own on the enemy
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yoimiya/burst.go
const AUROUS_BLAZE_PENDING_STATUS_ID = "yoimiya-aurous-blaze-pending";
const AUROUS_BLAZE_STATUS_ID = "yoimiya-aurous-blaze";
const AUROUS_BLAZE_COOLDOWN_STATUS_ID = "yoimiya-aurous-blaze-cooldown";

export const YOIMIYA_CHARACTER_ID = 10_000_049;

const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ATTACK_BONUS = 0.2;
const CONSTELLATION_1_ATTACK_SECONDS = 20;
const CONSTELLATION_1_AUROUS_BLAZE_SECONDS = 4;
const CONSTELLATION_1_SOURCE = "yoimiya-constellation-1";
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_PYRO_DAMAGE_BONUS = 0.25;
const CONSTELLATION_2_SECONDS = 6;
const CONSTELLATION_2_SOURCE = "yoimiya-constellation-2";

// Yoimiya's behaviour: Niwabi Fire-Dance's stance of Blazing Arrows for the table's seconds, ending as she leaves the
// Field, and Ryuukin Saxifrage marking the first enemy its hit strikes with Aurous Blaze, whose explosion another
// Member's hits set off. Constellation 1 extends it and raises her ATK on a defeat, and Constellation 2 raises her
// Pyro DMG on a CRIT. Her passives and Constellations 4 and 6 are not built yet
// Constellation 4 needs Aurous Blaze's explosions to cut Niwabi Fire-Dance's cooldown, which the kit does not build
// Constellation 6 needs the Niwabi Fire-Dance Normal Attacks' extra arrow chance, which the kit does not build
export const createYoimiyaKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const [burstHit] = kit.elementalBurst.hits;
  const aurousBlazeExplosion = readHit("aurousBlazeExplosion");
  const niwabiFireDanceSeconds = readParameter("niwabiFireDanceSeconds");
  const aurousBlazeSeconds = readParameter("aurousBlazeSeconds");
  const aurousBlazeExplosionCooldownSeconds = readParameter("aurousBlazeExplosionCooldownSeconds");
  // The Blazing Arrows stay Normal Attack DMG, gcsim's AttackTagNormal in yoimiya/attack.go's Attack
  const niwabiFireDance = readStance("niwabiFireDance");
  return {
    // The burst readies Aurous Blaze for the first enemy its hit strikes
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        addKitStatus(kitEffectState, combatant.characterId, {
          id: AUROUS_BLAZE_PENDING_STATUS_ID,
          secondsRemaining: kit.elementalBurst.seconds,
        }),
    },
    // The burst's hit marks the first enemy it strikes with Aurous Blaze, and a hit another member deals a marked enemy
    // As a kind of attack off its cooldown sets off the explosion on it
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, isCritical, isDefeated, striker } = event;
      // Agate Ryuukin, from Constellation 1: a marked enemy defeated within Aurous Blaze raises Yoimiya's ATK by 20%
      if (
        isDefeated &&
        combatant.constellationCount >= CONSTELLATION_1 &&
        enemy.statuses.some(({ id }) => id === AUROUS_BLAZE_STATUS_ID)
      )
        buffKitMember(kitEffectState, characterId, {
          amount: CONSTELLATION_1_ATTACK_BONUS,
          attribute: Attribute.AttackPercent,
          secondsRemaining: CONSTELLATION_1_ATTACK_SECONDS,
          source: CONSTELLATION_1_SOURCE,
        });
      // A Procession of Bonfires, from Constellation 2: her Pyro CRIT gives her 25% Pyro DMG Bonus for 6 seconds
      if (
        isCritical &&
        combatant.constellationCount >= CONSTELLATION_2 &&
        striker.characterId === characterId &&
        (hit.element ?? Element.Pyro) === Element.Pyro
      )
        buffKitMember(kitEffectState, characterId, {
          amount: CONSTELLATION_2_PYRO_DAMAGE_BONUS,
          attribute: Attribute.PyroDamageBonus,
          secondsRemaining: CONSTELLATION_2_SECONDS,
          source: CONSTELLATION_2_SOURCE,
        });
      if (striker.characterId === characterId) {
        if (hit !== burstHit || !checkHasKitStatus(kitEffectState.effects, characterId, AUROUS_BLAZE_PENDING_STATUS_ID))
          return;
        removeKitEffects(
          kitEffectState,
          (effect) =>
            effect.kind === "status" &&
            effect.characterId === characterId &&
            effect.id === AUROUS_BLAZE_PENDING_STATUS_ID,
        );
        addEnemyStatus(enemy, {
          damageTakenBonus: 0,
          id: AUROUS_BLAZE_STATUS_ID,
          secondsRemaining:
            aurousBlazeSeconds +
            (combatant.constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_AUROUS_BLAZE_SECONDS : 0),
        });
        return;
      }
      const statusIds = new Set(enemy.statuses.map(({ id }) => id));
      if (
        attackTag === undefined ||
        !statusIds.has(AUROUS_BLAZE_STATUS_ID) ||
        statusIds.has(AUROUS_BLAZE_COOLDOWN_STATUS_ID)
      )
        return;
      addEnemyStatus(enemy, {
        damageTakenBonus: 0,
        id: AUROUS_BLAZE_COOLDOWN_STATUS_ID,
        secondsRemaining: aurousBlazeExplosionCooldownSeconds,
      });
      castKitSummon(
        kitEffectState,
        { facing: 0, height: 0, position: enemy.position },
        combatant,
        [aurousBlazeExplosion],
        { attackTag: AttackTag.ElementalBurst },
      );
    },
    // Niwabi Fire-Dance is a stance for the table's seconds whose normal attacks are the Blazing Arrows
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, niwabiFireDance, niwabiFireDanceSeconds, { isEndedOnSwap: true }),
    },
  };
};
