import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) shenhe/burst.go, Divine Maiden's Deliverance's field centred 2 metres ahead of the body, its DoT
// Ticking two hits each tick, the second its tick's offset on from the first, and the field's Ascension 1 Cryo DMG Bonus
// Of 15% for an active character inside it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/shenhe
const BURST_OFFSET_METRES = 2;
const BURST_ASCENSION = 1;
const BURST_CRYO_DAMAGE_BONUS = 0.15;
const BURST_CRYO_DAMAGE_BONUS_SOURCE = "shenhe-burst-cryo";
// Constellation 2: the active character inside the field gains 15% CRIT DMG on her Cryo attacks, as gcsim's c2buff does
const BURST_CONSTELLATION_2_CRIT_DAMAGE = 0.15;
const BURST_CONSTELLATION_2_CRIT_DAMAGE_SOURCE = "shenhe-burst-constellation-2";
const CONSTELLATION_1 = 1;
// Constellation 2 adds six seconds to the field, as gcsim (MIT) shenhe/burst.go's burstDuration does at 2 constellations
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_FIELD_SECONDS = 6;
// Constellation 4: each trigger of the Icy Quill gives Shenhe a Skyfrost Mantra stack, up to fifty, for sixty seconds, and
// Her Spring Spirit Summoning consumes them all, each adding 5% DMG to its hits, as gcsim (MIT) shenhe's c4 does
const CONSTELLATION_4 = 4;
const SKYFROST_MANTRA_MAXIMUM = 50;
const SKYFROST_MANTRA_SECONDS = 60;
const SKYFROST_MANTRA_DAMAGE_BONUS = 0.05;
// Constellation 6: a normal or charged attack's trigger still gives its bonus, but does not count toward the quota
const CONSTELLATION_6 = 6;

export const SHENHE_CHARACTER_ID = 10_000_063;
export const ICY_QUILL_STATUS_ID = "icy-quill";
export const SKYFROST_MANTRA_STATUS_ID = "skyfrost-mantra";
const SKYFROST_EMPOWERMENT_STATUS_ID = "skyfrost-empowerment";
// The attack kinds the Icy Quill's text names: a normal, charged or plunging attack, an elemental skill or burst
const ICY_QUILL_ATTACK_TAGS = new Set<AttackTag>([
  AttackTag.ChargedAttack,
  AttackTag.ElementalBurst,
  AttackTag.ElementalSkill,
  AttackTag.NormalAttack,
  AttackTag.PlungingAttack,
]);

// Whether a hit is dealt as an attack kind the Icy Quill names, a hit with none, such as a reaction or a field's tick, not
const checkIsIcyQuillAttack = (attackTag: AttackTag | undefined): attackTag is AttackTag =>
  attackTag !== undefined && ICY_QUILL_ATTACK_TAGS.has(attackTag);

// Gives each party member other than the one casting the Icy Quill, restarting one it already holds, for its seconds and
// Its triggers
const grantIcyQuill = (
  { activeCombatant, characterIdCombatantMap, kitEffectState, party }: KitContext,
  secondsRemaining: number,
  triggers: number,
): void => {
  for (const { characterId } of getDeployedCombatants(party, characterIdCombatantMap))
    if (characterId !== activeCombatant.characterId)
      addKitStatus(kitEffectState, characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining, stacks: triggers });
};

// Adds a Skyfrost Mantra stack to Shenhe, restarting its seconds, up to the maximum
const gainSkyfrostMantra = (kitEffectState: KitEffectState, characterId: number): void => {
  const stacks = (findKitStatus(kitEffectState.effects, characterId, SKYFROST_MANTRA_STATUS_ID)?.stacks ?? 0) + 1;
  addKitStatus(kitEffectState, characterId, {
    id: SKYFROST_MANTRA_STATUS_ID,
    secondsRemaining: SKYFROST_MANTRA_SECONDS,
    stacks: Math.min(SKYFROST_MANTRA_MAXIMUM, stacks),
  });
};

// Consumes all of Shenhe's Skyfrost Mantra stacks as her Spring Spirit Summoning starts, into the empowerment its hits read,
// For the seconds the summoning plays
const empowerSpringSpiritSummoning = ({ activeCombatant, kitEffectState }: KitContext): void => {
  const { characterId } = activeCombatant;
  const mantra = findKitStatus(kitEffectState.effects, characterId, SKYFROST_MANTRA_STATUS_ID);
  if (mantra === undefined) return;
  removeKitEffects(
    kitEffectState,
    (effect) =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === SKYFROST_MANTRA_STATUS_ID,
  );
  addKitStatus(kitEffectState, characterId, {
    id: SKYFROST_EMPOWERMENT_STATUS_ID,
    secondsRemaining: activeCombatant.kit.elementalSkill.seconds,
    stacks: mantra.stacks,
  });
};

// Spends one of a member's Icy Quill triggers, keeping the quill's seconds as they stand, and ends the quill with its last
const spendIcyQuillTrigger = (kitEffectState: KitEffectState, characterId: number): void => {
  const quill = findKitStatus(kitEffectState.effects, characterId, ICY_QUILL_STATUS_ID);
  if (quill === undefined) return;
  const triggers = (quill.stacks ?? 0) - 1;
  if (triggers > 0)
    addKitStatus(kitEffectState, characterId, {
      id: ICY_QUILL_STATUS_ID,
      secondsRemaining: quill.secondsRemaining,
      stacks: triggers,
    });
  else
    removeKitEffects(
      kitEffectState,
      (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === ICY_QUILL_STATUS_ID,
    );
};

// Shenhe's behaviour: Divine Maiden's Deliverance casts its field ahead of her, whose DoT ticks give the enemies within it
// The burst's RES Decrease and, from Ascension 1, give the active character its Cryo DMG Bonus. Her skill's Icy Quill
// Adds Shenhe's ATK to each Cryo hit the other party members strike from an attack kind, spending one of its triggers. It
// Is priced by a party strike hook and spent by the hits' events. Constellation 1's charge, Constellation 2's field, and
// Constellations 4 and 6's Skyfrost Mantra and quota are built; her other passives are not
// Constellation 2's field runs six seconds longer, and its active character gains Cryo CRIT DMG inside it
export const createShenheKitBehaviour = ({
  readHitFields,
  readParameter,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const burstDurationSeconds = readParameter("talismanSpiritSeconds");
  const burstResistanceReduction = readParameter("talismanSpiritResistanceReduction");
  const burstStartSeconds = readSeconds("talismanSpiritStart");
  const burstFirstTickSeconds = readSeconds("talismanSpiritFirstTick");
  const fieldTickIntervalSeconds = readSeconds("talismanSpiritTickInterval");
  const burstTickSecondHitSeconds = readSeconds("talismanSpiritTickSecondHit");
  // The Cryo and Physical RES Decrease a DoT tick gives, held for the tick interval until the next tick
  const burstResistanceStatus: EnemyStatus = {
    damageTakenBonus: 0,
    id: "shenhe-burst-shred",
    physicalResistanceReduction: burstResistanceReduction,
    resistanceReduction: { [Element.Cryo]: burstResistanceReduction },
    secondsRemaining: fieldTickIntervalSeconds,
  };
  // The Icy Quill's ATK ratio, seconds and triggers, a press's and a hold's, from Spring Spirit Summoning's proud skill group
  const icyQuillAttackRatio = readParameter("icyQuillAttackRatio");
  const icyQuillPressSeconds = readParameter("icyQuillPressSeconds");
  const icyQuillHoldSeconds = readParameter("icyQuillHoldSeconds");
  const icyQuillPressTriggers = readParameter("icyQuillPressTriggers");
  const icyQuillHoldTriggers = readParameter("icyQuillHoldTriggers");
  const burstTickFields = readHitFields("talismanSpiritTick", ["hitmarkSeconds"]);
  const createBurstTickHit = (hitmarkSeconds: number): KitHit => ({
    ...burstTickFields,
    enemyStatus: () => burstResistanceStatus,
    hitmarkSeconds,
  });
  // Each tick's two hits, the second at its tick's offset, the offsets taken in turn
  const burstTicks = readSecondsList("talismanSpiritTickSecondHitOffsets").map((offsetSeconds) => [
    createBurstTickHit(0),
    createBurstTickHit(burstTickSecondHitSeconds + offsetSeconds),
  ]);
  return {
    skill: {
      onStart: (context) => {
        grantIcyQuill(context, icyQuillPressSeconds, icyQuillPressTriggers);
        empowerSpringSpiritSummoning(context);
      },
    },
    skillHolds: [
      {
        onStart: (context) => {
          grantIcyQuill(context, icyQuillHoldSeconds, icyQuillHoldTriggers);
          empowerSpringSpiritSummoning(context);
        },
      },
    ],
    // Her Spring Spirit Summoning's hits gain 5% DMG for each Skyfrost Mantra stack it consumed as it started
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ElementalSkill
        ? (findKitStatus(effects, strike.combatant.characterId, SKYFROST_EMPOWERMENT_STATUS_ID)?.stacks ?? 0) *
          SKYFROST_MANTRA_DAMAGE_BONUS
        : 0,
    // Each Cryo hit a member carrying the Icy Quill strikes adds Shenhe's current ATK times its ratio to the hit's base damage
    getPartyStrikeBonus: (member, strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (
        getKitHitElement(strike.hit, strike.combatant) !== Element.Cryo ||
        !checkIsIcyQuillAttack(strike.attackTag) ||
        !checkHasKitStatus(effects, strike.combatant.characterId, ICY_QUILL_STATUS_ID)
      )
        return {};
      const { attack } = getBuffedCombatant(member, effects, party, characterIdCombatantMap).attributes;
      return { additiveBaseDamageBonus: attack * icyQuillAttackRatio };
    },
    // Each Cryo hit from an attack kind a member carrying the Icy Quill lands on an enemy triggers it, spending one of its
    // Triggers unless Constellation 6 exempts a normal or charged attack, and gives Shenhe a Skyfrost Mantra stack from
    // Constellation 4
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.element !== Element.Cryo ||
        !checkIsIcyQuillAttack(event.attackTag)
      )
        return;
      const { characterId } = event.striker;
      if (!checkHasKitStatus(kitEffectState.effects, characterId, ICY_QUILL_STATUS_ID)) return;
      if (combatant.constellationCount < CONSTELLATION_6 || !checkIsNormalOrChargedAttack(event.attackTag))
        spendIcyQuillTrigger(kitEffectState, characterId);
      if (combatant.constellationCount >= CONSTELLATION_4) gainSkyfrostMantra(kitEffectState, combatant.characterId);
    },
    burst: {
      // The field is cast ahead of the body, as far across as its DoT reaches, and its DoT and buff are summoned there, so
      // It stands where gcsim places it
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const centreBody = createAheadBody(body, BURST_OFFSET_METRES);
        castKitField(kitEffectState, combatant.characterId, centreBody.position, {
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }, tickIndex) => {
            if (combatant.constellationCount >= CONSTELLATION_2)
              addKitEffect(tickEffectState, {
                amount: BURST_CONSTELLATION_2_CRIT_DAMAGE,
                characterId: activeCombatant.characterId,
                element: Element.Cryo,
                kind: "elementCriticalDamage",
                secondsRemaining: fieldTickIntervalSeconds,
                source: BURST_CONSTELLATION_2_CRIT_DAMAGE_SOURCE,
              });
            if (combatant.ascension >= BURST_ASCENSION)
              buffKitMember(tickEffectState, activeCombatant.characterId, {
                amount: BURST_CRYO_DAMAGE_BONUS,
                attribute: Attribute.CryoDamageBonus,
                secondsRemaining: fieldTickIntervalSeconds,
                source: BURST_CRYO_DAMAGE_BONUS_SOURCE,
              });
            castKitSummon(tickEffectState, centreBody, combatant, takeOne(burstTicks, tickIndex % burstTicks.length));
          },
          radius: burstTickFields.hitArea.radius,
          secondsRemaining:
            burstDurationSeconds +
            burstStartSeconds +
            0.1 +
            (combatant.constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_FIELD_SECONDS : 0),
          tickIntervalSeconds: fieldTickIntervalSeconds,
        });
      },
    },
    // Clarity of Heart, from Constellation 1, lets Spring Spirit Summoning be used one more time
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
  };
};
