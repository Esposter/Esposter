import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

// Stormbreaker's Thunderbeast's Targe discharges at most once a second, as the wiki's Stormbreaker and gcsim v2.47.2
// (MIT) beidou/burst.go give it
// https://genshin-impact.fandom.com/wiki/Stormbreaker
const DISCHARGE_INTERVAL_SECONDS = 1;
// Bane of Evil, from six constellations, takes 15% off the Electro RES of the enemies round the body on the field while
// Stormbreaker stands, as the wiki's constellation page gives it, and gcsim v2.47.2 (MIT) beidou/burst.go gives the
// Enemies within reach of it the cut for the frames its record holds
// https://genshin-impact.fandom.com/wiki/Bane_of_Evil
const BANE_OF_EVIL_CONSTELLATION = 6;
// Stunning Revenge, from Constellation 4: a hit Beidou takes while she is on the field gives her normal attacks an extra
// Electro hit of 20% of her ATK after each hit they land, for 10 seconds. gcsim v2.47.2 (MIT) beidou/cons.go gives the
// Status, its 10 seconds and the 20%, and its hit one per attack, and the table's 30 poise and 1U of Electro
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/beidou/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_STATUS_ID = "beidou-constellation-4";
const CONSTELLATION_4_SECONDS = 10;
const CONSTELLATION_4_DAMAGE_MULTIPLIER = 0.2;
const CONSTELLATION_4_POISE_DAMAGE = 30;

// Whether an effect is the Thunderbeast's Targe of a character's, still standing the given seconds from now: the Targe
// Is her summon that follows the body on the field
const checkIsTargeStanding = (effect: KitEffect, characterId: number, seconds: number): boolean =>
  effect.kind === "summon" &&
  effect.isFollowing === true &&
  effect.combatant.characterId === characterId &&
  effect.secondsRemaining >= seconds;

export const BEIDOU_CHARACTER_ID = 10_000_024;

// Beidou's behaviour: Tidecaller's press sets her Electro shield until its hit, and Stormbreaker casts the Thunderbeast's
// Targe, a summon that follows the body on the field for its seconds, landing Bane of Evil's cut from six
// Constellations. While the Targe stands, her strikes and charged attack cast its lightning discharge beside their hits
// Constellation 1 needs a shield that absorbs Electro damage 250% more, which the shield's absorb does not scale
// Constellation 2 needs Stormbreaker's arc lightning to jump to two more targets, which the burst's hit does not chain
// Constellation 4 is built for a hit she takes on the field, an enemy's strike, a drown or a wildlife's charge: its extra
// Electro hit lands where her normal attack's hit reaches, where gcsim hits the enemy it struck alone. The wiki says it
// Also applies to her charged attack, which is not built: gcsim leaves it out, and the hook is handed only normal attacks
export const createBeidouKitBehaviour = ({
  kit,
  readHitFields,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const targeSeconds = readParameter("thunderbeastsTargeSeconds");
  const shieldMaxHealthShare = readParameter("tidecallerShieldMaxHealthShare");
  const shieldFlatHealth = readParameter("tidecallerShieldFlatHealth");
  const tidecallerHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const baneOfEvilStatus: EnemyStatus = {
    damageTakenBonus: 0,
    id: "beidou-bane-of-evil",
    resistanceReduction: { [Element.Electro]: 0.15 },
    secondsRemaining: readSeconds("baneOfEvil"),
  };
  const baneOfEvilTicks = readHits("baneOfEvilTicks", { enemyStatus: () => baneOfEvilStatus });
  // The Targe's lightning discharge beside each hit of her strikes and charged attack, landing its delay past the hit.
  // Gcsim chains it from the enemy struck to a random other within 8 metres, which an area cannot pick, so it reaches what
  // Its hit reaches, and the record's fields hold the rest of it
  const lightningDischargeFields = readHitFields("lightningDischarge", ["hitArea"]);
  const chargedAttackHits = kit.chargedAttack.hits;
  const hitDischargeMap = new Map(
    [...kit.normalAttacks.flatMap(({ hits }) => hits), ...chargedAttackHits].map((hit): [KitHit, KitHit] => [
      hit,
      {
        ...lightningDischargeFields,
        hitArea: hit.hitArea,
        hitmarkSeconds: hit.hitmarkSeconds + lightningDischargeFields.hitmarkSeconds,
      },
    ]),
  );
  const dischargeHits = new Set(hitDischargeMap.values());
  // Casts a discharge where Beidou stands beside each of an action's hits whose hitmark her Targe still stands at, unless
  // An earlier discharge's second runs past it. Each is a summon standing until a second past its hit, so it marks that
  // Second as it stands
  const castDischarges = (
    { facing, height, position }: KitBody,
    combatant: Combatant,
    kitEffectState: KitEffectState,
    hits: readonly KitHit[],
  ): void => {
    for (const hit of hits) {
      const discharge = hitDischargeMap.get(hit);
      const { effects } = kitEffectState;
      if (
        discharge === undefined ||
        !effects.some((effect) => checkIsTargeStanding(effect, combatant.characterId, hit.hitmarkSeconds)) ||
        effects.some(
          (effect) =>
            effect.kind === "summon" &&
            effect.secondsRemaining > hit.hitmarkSeconds &&
            effect.hits.some((summonHit) => dischargeHits.has(summonHit)),
        )
      )
        continue;
      castKitSummon(kitEffectState, { facing, height, position }, combatant, [discharge], {
        secondsRemaining: hit.hitmarkSeconds + DISCHARGE_INTERVAL_SECONDS,
      });
    }
  };
  return {
    // The Thunderbeast's Targe stands from the cast for the group's seconds as a summon that follows the body on the
    // Field, whoever it is, as the wiki's notes give it
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) =>
        castKitSummon(
          kitEffectState,
          { facing, height, position },
          combatant,
          combatant.constellationCount >= BANE_OF_EVIL_CONSTELLATION ? baneOfEvilTicks : [],
          { isFollowing: true, secondsRemaining: targeSeconds },
        ),
    },
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castDischarges(body, combatant, kitEffectState, chargedAttackHits),
    },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castDischarges(body, combatant, kitEffectState, hits),
    })),
    // Stunning Revenge: a hit she takes while she is on the field starts its status, and each hit a normal attack of hers
    // Lands while it runs is followed by the extra Electro hit
    onKitEvent: (event, { activeCombatant, kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.HealthChanged || combatant.constellationCount < CONSTELLATION_4) return;
      const { characterId } = combatant;
      if (
        event.characterId !== characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined ||
        activeCombatant.characterId !== characterId
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_SECONDS,
      });
    },
    getNormalAttackExtraHit: ({ activeCombatant, kitEffectState }, hit) =>
      activeCombatant.constellationCount >= CONSTELLATION_4 &&
      checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, CONSTELLATION_4_STATUS_ID)
        ? {
            element: Element.Electro,
            gauge: 1,
            hitArea: hit.hitArea,
            hitmarkSeconds: hit.hitmarkSeconds,
            internalCooldownTag: InternalCooldownTag.ElementalBurst,
            poiseDamage: CONSTELLATION_4_POISE_DAMAGE,
            talentMultiplier: CONSTELLATION_4_DAMAGE_MULTIPLIER,
          }
        : undefined,
    // Tidecaller's Electro shield is set at the press, of the group's share of Beidou's Max HP plus its flat HP, and
    // Stands until the hit, as gcsim's does
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Electro,
          health: shieldMaxHealthShare * combatant.attributes.maxHealth + shieldFlatHealth,
          secondsRemaining: tidecallerHitmarkSeconds,
        }),
    },
  };
};
