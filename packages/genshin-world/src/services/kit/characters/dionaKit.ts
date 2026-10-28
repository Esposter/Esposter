import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) diona/burst.go, Signature Mix's field healing within a circle of radius 7 round it every
// Two seconds from two seconds after the initial hit
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diona/burst.go
const SIGNATURE_MIX_FIELD_RADIUS = 7;
const SIGNATURE_MIX_TICK_SECONDS = 2;
// Provisional: gcsim's field lasts 750 frames, half a second past the table's 12 seconds, which this adds to it
const SIGNATURE_MIX_FIELD_MARGIN_SECONDS = 0.5;
const SIGNATURE_MIX_FIELD_ID = "diona-signature-mix-field";

// Measured: gcsim v2.47.2 (MIT) diona/skill.go, Icy Paws' shield at 1.15 times its strength from two constellations, which
// Is gcsim's C2. Diona's hold shield is the table's bonus times the tap's shield
const SHIELD_CONSTELLATION = 2;
const SHIELD_CONSTELLATION_MULTIPLIER = 1.15;
// Measured: gcsim v2.47.2 (MIT) diona/cons.go, the first constellation's 15 energy returned as Signature Mix's field ends
const SIGNATURE_MIX_CONSTELLATION = 1;
const SIGNATURE_MIX_CONSTELLATION_ENERGY = 15;

// From the wiki's Signature Mix page, its sixth constellation, Cat's Tail Closing Time: each character within the field's
// Radius gains 200 Elemental Mastery above half its HP, or 30% Incoming Healing Bonus at or below it. The field ticks each
// Half-second, and a tick's buffs last until the next, so they fade within half a second of the body leaving the field
// https://genshin-impact.fandom.com/wiki/Signature_Mix
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_HEALTH_SHARE = 0.5;
const CONSTELLATION_6_ELEMENTAL_MASTERY = 200;
const CONSTELLATION_6_INCOMING_HEALING_BONUS = 0.3;
const CONSTELLATION_6_TICK_SECONDS = 0.5;
const CONSTELLATION_6_FIELD_ID = "diona-constellation-6-field";
const CONSTELLATION_6_SOURCE = "diona-constellation-6";

// Drunkards' Farce, as the dump's Diona_PermanentSkill_2 row (promote 4, params -0.1 and 15) gives it: from Ascension 4,
// Enemies Signature Mix reaches lose 10% of their ATK for 15 seconds. gcsim leaves it unbuilt, so each enemy the burst's
// Initial hit or a tick strikes is the one that entered its AoE
const DRUNKARDS_FARCE_ASCENSION = 4;
const DRUNKARDS_FARCE_STATUS: EnemyStatus = {
  attackReduction: 0.1,
  damageTakenBonus: 0,
  id: "diona-drunkards-farce",
  secondsRemaining: 15,
};
const getDrunkardsFarceStatus = ({ ascension }: Combatant): EnemyStatus | undefined =>
  ascension >= DRUNKARDS_FARCE_ASCENSION ? DRUNKARDS_FARCE_STATUS : undefined;

// The buffs Cat's Tail Closing Time gives each deployed member on a tick, each lasting to the next: Elemental Mastery above
// Half its HP, and Incoming Healing Bonus at or below it
const addConstellation6Buffs = ({ kitEffectState, party }: KitContext): void => {
  for (const characterId of getDeployedCharacterIds(party)) {
    const { healthShare } = getPartyMember(party, characterId);
    if (healthShare <= CONSTELLATION_6_HEALTH_SHARE)
      buffKitMember(kitEffectState, characterId, {
        amount: CONSTELLATION_6_INCOMING_HEALING_BONUS,
        attribute: Attribute.IncomingHealingBonus,
        secondsRemaining: CONSTELLATION_6_TICK_SECONDS,
        source: CONSTELLATION_6_SOURCE,
      });
    else
      buffKitMember(kitEffectState, characterId, {
        amount: CONSTELLATION_6_ELEMENTAL_MASTERY,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: CONSTELLATION_6_TICK_SECONDS,
        source: CONSTELLATION_6_SOURCE,
      });
  }
};

export const DIONA_CHARACTER_ID = 10_000_039;

// Diona's behaviour: Icy Paws' tap casts her shield as it starts, and its hold the shield times the hold's bonus, which
// Constellation 2 raises. Signature Mix casts its field, healing the character on the field, and its ticks, a summon at
// The cast's body; from Constellation 1 she regains energy as the field ends, from Constellation 6 a second field of the
// Same circle buffs the team on each half-second tick, and from Ascension 4 the burst's hits cut the ATK of the enemies
// They strike. Her Ascension 1 passive and Constellation 4 are not built, as the kit events do not reach them
// Constellation 4 needs the aimed shot's charge time read within Signature Mix's radius, not read by the charged attack
export const createDionaKitBehaviour = ({ kit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shieldMaxHealthShare = readParameter("shieldMaxHealthShare");
  const shieldFlatHealth = readParameter("shieldFlatHealth");
  const shieldSeconds = readParameter("shieldSeconds");
  const holdShieldMultiplier = readParameter("holdShieldMultiplier");
  const signatureMixHealMaxHealthShare = readParameter("signatureMixHealMaxHealthShare");
  const signatureMixHealFlatHealth = readParameter("signatureMixHealFlatHealth");
  const signatureMixSeconds = readParameter("signatureMixSeconds") + SIGNATURE_MIX_FIELD_MARGIN_SECONDS;
  const signatureMixTicks = readHits("signatureMixTicks", { enemyStatus: getDrunkardsFarceStatus });
  const signatureMixHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  // The shield is a share of her Max HP and a flat amount, times its strength, which Constellation 2 raises by 15%
  const castShield = (context: KitContext, combatant: Combatant, strengthMultiplier: number): KitShield => {
    const { characterIdCombatantMap, kitEffectState, party } = context;
    const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
    return castKitShield(context, combatant.characterId, {
      element: Element.Cryo,
      health:
        (shieldMaxHealthShare * maxHealth + shieldFlatHealth) *
        strengthMultiplier *
        (combatant.constellationCount >= SHIELD_CONSTELLATION ? SHIELD_CONSTELLATION_MULTIPLIER : 1),
      secondsRemaining: shieldSeconds,
    });
  };
  return {
    burst: {
      hits: [{ enemyStatus: getDrunkardsFarceStatus }],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: SIGNATURE_MIX_FIELD_ID,
          nextTickSeconds: signatureMixHitmarkSeconds + SIGNATURE_MIX_TICK_SECONDS,
          onTick: (tick) => {
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              signatureMixHealMaxHealthShare *
                getKitMaxHealth(combatant, tick.kitEffectState.effects, tick.party, tick.characterIdCombatantMap) +
                signatureMixHealFlatHealth,
            );
          },
          radius: SIGNATURE_MIX_FIELD_RADIUS,
          secondsRemaining: signatureMixSeconds,
          tickIntervalSeconds: SIGNATURE_MIX_TICK_SECONDS,
        });
        castKitSummon(kitEffectState, body, combatant, signatureMixTicks, {
          attackTag: AttackTag.ElementalBurst,
          secondsRemaining: signatureMixSeconds,
        });
        if (combatant.constellationCount >= CONSTELLATION_6)
          castKitField(kitEffectState, combatant.characterId, body.position, {
            id: CONSTELLATION_6_FIELD_ID,
            nextTickSeconds: signatureMixHitmarkSeconds,
            onTick: addConstellation6Buffs,
            radius: SIGNATURE_MIX_FIELD_RADIUS,
            secondsRemaining: signatureMixSeconds,
            tickIntervalSeconds: CONSTELLATION_6_TICK_SECONDS,
          });
      },
    },
    // Constellation 1 returns 15 energy to Diona as her field ends, as the game's text gives it
    onKitEvent: (event, { party }, combatant) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "field" &&
        event.effect.id === SIGNATURE_MIX_FIELD_ID &&
        event.effect.characterId === combatant.characterId &&
        combatant.constellationCount >= SIGNATURE_MIX_CONSTELLATION
      )
        gainPartyMemberEnergy(party, combatant, SIGNATURE_MIX_CONSTELLATION_ENERGY);
    },
    skill: { onStart: (context) => castShield(context, context.activeCombatant, 1) },
    skillHolds: [{ onStart: (context) => castShield(context, context.activeCombatant, holdShieldMultiplier) }],
  };
};
