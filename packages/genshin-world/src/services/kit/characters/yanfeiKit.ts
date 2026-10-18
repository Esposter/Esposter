import type { Except } from "type-fest";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

// The stamina each seal cuts a charged attack's cost by is 15%, 25% from Constellation 1, as gcsim (MIT) yanfei/asc.go
// Gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yanfei/asc.go
const CHARGED_ATTACK_STAMINA_REDUCTION = 0.15;
const CHARGED_ATTACK_STAMINA_CONSTELLATION = 1;
const CHARGED_ATTACK_STAMINA_REDUCTION_FROM_CONSTELLATION = 0.25;
// Done Deal adds a Scarlet Seal each second for its 15 seconds, and its Pyro DMG bonus to Charged Attacks, as gcsim (MIT)
// Yanfei/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yanfei/burst.go
const BURST_SECONDS = 15;
const BURST_SEAL_INTERVAL_SECONDS = 1;
const DONE_DEAL_STATUS_ID = "yanfei-done-deal";
// Scarlet Seals last 10 seconds from the last one gained, and Yanfei holds three of them, four from Constellation 6, as
// Gcsim (MIT) yanfei/yanfei.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yanfei/yanfei.go
const SEAL_SECONDS = 10;
const MAX_SEALS = 3;
const MAX_SEALS_CONSTELLATION = 6;
const MAX_SEALS_WITH_CONSTELLATION = 4;
// A seal is a status of its own slot, as a status of one id restarts rather than stacks, so the count is the slots held
const SEAL_STATUS_IDS = ["yanfei-seal-0", "yanfei-seal-1", "yanfei-seal-2", "yanfei-seal-3"];
// Ascension 1 gives 5% Pyro DMG Bonus per seal consumed for 6 seconds, which a charged attack dispels, as gcsim (MIT)
// Yanfei/asc.go gives it
const SEAL_PYRO_BONUS_ASCENSION = 1;
const SEAL_PYRO_BONUS_PER_SEAL = 0.05;
const SEAL_PYRO_BONUS_SECONDS = 6;
// Blazing Eye, as the dump's Feiyan_PermanentSkill_2 row (promote 4, param 0.8) and gcsim v2.47.2 (MIT) yanfei/asc.go
// Give it: from Ascension 4, the first CRIT hit a charged attack of hers lands while she is on the field sets off 80% of
// Her ATK as 1U of Pyro, Charged Attack DMG, in a circle of radius 3.5 round the enemy struck, 10 frames on, which the
// Record's frames give. gcsim gives it no poise
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yanfei/asc.go
const BLAZING_EYE_ASCENSION = 4;
const BLAZING_EYE_HIT: Except<KitHit, "hitmarkSeconds"> = {
  attackTag: AttackTag.ChargedAttack,
  element: Element.Pyro,
  gauge: 1,
  hitArea: { angle: 2 * Math.PI, height: 2, radius: 3.5 },
  poiseDamage: 0,
  talentMultiplier: 0.8,
};

const checkIsSealStatus = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "status" && effect.characterId === characterId && SEAL_STATUS_IDS.includes(effect.id);

const countSeals = (kitEffectState: KitEffectState, characterId: number): number =>
  kitEffectState.effects.filter((effect) => checkIsSealStatus(effect, characterId)).length;

const getMaximumSeals = (combatant: Combatant): number =>
  combatant.constellationCount >= MAX_SEALS_CONSTELLATION ? MAX_SEALS_WITH_CONSTELLATION : MAX_SEALS;

// Sets the seals Yanfei holds to the count given, each restarting its slot, so every seal runs out together
const setSeals = (kitEffectState: KitEffectState, characterId: number, count: number): void => {
  for (const id of SEAL_STATUS_IDS.slice(0, count))
    addKitStatus(kitEffectState, characterId, { id, secondsRemaining: SEAL_SECONDS });
};

const gainSeals = (kitEffectState: KitEffectState, combatant: Combatant, gained: number): void => {
  const count = Math.min(countSeals(kitEffectState, combatant.characterId) + gained, getMaximumSeals(combatant));
  setSeals(kitEffectState, combatant.characterId, count);
};

const checkIsDoneDealActive = (kitEffectState: KitEffectState, characterId: number): boolean =>
  kitEffectState.effects.some(
    (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === DONE_DEAL_STATUS_ID,
  );

export const YANFEI_CHARACTER_ID = 10_000_048;

const CONSTELLATION_2 = 2;
const CONSTELLATION_2_CRIT_RATE_BONUS = 0.2;
const CONSTELLATION_2_HEALTH_SHARE = 0.5;

// Yanfei's behaviour: her strikes each gain a Scarlet Seal on each enemy they strike, and Signed Edict's and Done Deal's
// Hits give her the full seals, three, four from Constellation 6. Her charged attack spends the seals as it starts, its
// Hit a summon cast at the body, whose multiplier and radius the seals spent pick, with Done Deal's Pyro DMG bonus while
// It is up, and Ascension 1's bonus set from them; each seal cuts its stamina, more from Constellation 1. Done Deal adds a
// Seal each second while it stands. From Ascension 4 the first CRIT hit of each charged attack sets off Blazing Eye round
// The enemy struck. Her Constellation 2 CRIT Rate reads the enemy's health, and her Constellation 4 shield is not built, as no
// Kit event reaches the shield's health. Constellation 4 needs the Done Deal shield's Pyro absorption at 250%, which the kit does not build
export const createYanfeiKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const blazingEyeHit: KitHit = { ...BLAZING_EYE_HIT, hitmarkSeconds: readSeconds("blazingEyeHitmark") };
  const doneDealDamageBonus = readParameter("doneDealChargedAttackDamageBonus");
  // The charged attack's hit at each count of seals spent, the count picking its reach and multiplier as she plays
  const chargedAttackHits = readHits("scarletSealChargedAttacks");
  // A strike's seal is gained as it lands on an enemy, one for each enemy struck, capped at the most Yanfei holds
  const strikeHit: KitHitBehaviour = {
    onStrike: ({ kitEffectState }, { combatant }) => gainSeals(kitEffectState, combatant, 1),
  };
  // The charged attacks' hits that may still set off Blazing Eye, each one until its first CRIT hit
  const blazingEyeArmedHits = new WeakSet<KitHit>();
  const fullSealsHit: KitHitBehaviour = {
    onStrike: ({ kitEffectState }, { combatant }) =>
      setSeals(kitEffectState, combatant.characterId, getMaximumSeals(combatant)),
  };
  return {
    // Done Deal's hit gives the full seals, and its seconds add one each second while it stands, on a field the whole
    // Battlefield holds, as gcsim's tick runs wherever Yanfei is
    burst: {
      hits: [fullSealsHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        addKitStatus(kitEffectState, combatant.characterId, {
          id: DONE_DEAL_STATUS_ID,
          secondsRemaining: BURST_SECONDS,
        });
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: BURST_SEAL_INTERVAL_SECONDS,
          onTick: ({ kitEffectState: tickEffectState }) => gainSeals(tickEffectState, combatant, 1),
          secondsRemaining: BURST_SECONDS,
          tickIntervalSeconds: BURST_SEAL_INTERVAL_SECONDS,
        });
      },
    },
    // The charged attack spends the seals as it starts, its hit a summon cast at the body. The seals it spent set its
    // Multiplier and radius, and the Done Deal's Pyro DMG bonus while it is up. Ascension 1's bonus is set from them too
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const seals = countSeals(kitEffectState, combatant.characterId);
        if (combatant.ascension >= SEAL_PYRO_BONUS_ASCENSION)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: seals * SEAL_PYRO_BONUS_PER_SEAL,
            attribute: Attribute.PyroDamageBonus,
            secondsRemaining: SEAL_PYRO_BONUS_SECONDS,
            source: "yanfei-a1",
          });
        const hit: KitHit = {
          ...(checkIsDoneDealActive(kitEffectState, combatant.characterId) && { damageBonus: doneDealDamageBonus }),
          ...takeOne(chargedAttackHits, seals),
        };
        castKitSummon(kitEffectState, body, combatant, [hit]);
        if (combatant.ascension >= BLAZING_EYE_ASCENSION) blazingEyeArmedHits.add(hit);
        removeKitEffects(kitEffectState, (effect) => checkIsSealStatus(effect, combatant.characterId));
      },
    },
    getChargedAttackStaminaMultiplier: ({ activeCombatant: combatant, kitEffectState }) => {
      const reduction =
        combatant.constellationCount >= CHARGED_ATTACK_STAMINA_CONSTELLATION
          ? CHARGED_ATTACK_STAMINA_REDUCTION_FROM_CONSTELLATION
          : CHARGED_ATTACK_STAMINA_REDUCTION;
      return 1 - reduction * countSeals(kitEffectState, combatant.characterId);
    },
    // Right of Final Interpretation, from Constellation 2: her Charged Attacks crit 20% more often below half enemy HP
    getStrikeCriticalRateBonus: ({ attackTag, combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_2 &&
      attackTag === AttackTag.ChargedAttack &&
      enemy.health / enemy.maxHealth < CONSTELLATION_2_HEALTH_SHARE
        ? CONSTELLATION_2_CRIT_RATE_BONUS
        : 0,
    normalAttacks: [{ hits: [strikeHit] }, { hits: [strikeHit] }, { hits: [strikeHit] }],
    // A charged attack's first CRIT hit while she is on the field sets off Blazing Eye round the enemy it struck
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        !event.isCritical ||
        !blazingEyeArmedHits.has(event.hit) ||
        getActiveCharacterId(party) !== combatant.characterId
      )
        return;
      blazingEyeArmedHits.delete(event.hit);
      castKitSummon(kitEffectState, { facing: 0, height: 0, position: event.enemy.position }, combatant, [
        blazingEyeHit,
      ]);
    },
    skill: { hits: [fullSealsHit] },
  };
};
