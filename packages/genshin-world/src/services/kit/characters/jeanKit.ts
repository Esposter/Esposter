import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

// The Dandelion Field ticks every second from its activation, its tick 0, as the wiki's Dandelion Breeze notes give its
// 10 regenerations a second apart and gcsim v2.47.2 (MIT) jean/burst.go every 60 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/burst.go
const DANDELION_FIELD_TICK_INTERVAL_SECONDS = 1;
// The field and its damage live a tenth of a second past their end, so the step that runs the last tick and lands the
// Exiting damage still has them
const DANDELION_FIELD_LINGER_SECONDS = 0.1;
// Spiraling Tempest, from one constellation, raises Gale Blade's DMG by 40% once it is held over a second, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) jean/cons.go give it, which gcsim's skill.go checks at 60 frames held
// https://genshin-impact.fandom.com/wiki/Spiraling_Tempest
const SPIRALING_TEMPEST_CONSTELLATION = 1;
const SPIRALING_TEMPEST_DAMAGE_BONUS = 0.4;
// Wind Companion, from Ascension 1, gives each normal attack hit a 50% chance to heal every party member by 15% of Jean's
// ATK, as the wiki's passive page and gcsim v2.47.2 (MIT) jean/asc.go give it
// https://genshin-impact.fandom.com/wiki/Wind_Companion
const WIND_COMPANION_ASCENSION = 1;
const WIND_COMPANION_CHANCE = 0.5;
// Let the Wind Lead, from Ascension 4, regenerates 20% of Dandelion Breeze's energy as it is used, 16 of its 80, as the
// Wiki's passive page gives it. gcsim v2.47.2 (MIT) jean/asc.go adds it at 41 frames, a frame past the activation
// https://genshin-impact.fandom.com/wiki/Let_the_Wind_Lead
const LET_THE_WIND_LEAD_ASCENSION = 4;
const LET_THE_WIND_LEAD_ENERGY_SHARE = 0.2;
// Constellation 2: each particle or orb Jean picks up gives every party member 15% Movement SPD and ATK SPD for 15 seconds,
// As gcsim v2.47.2 (MIT) jean/cons.go gives it while Jean is on the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/cons.go
const PARTY_SPEED_CONSTELLATION = 2;
const PARTY_SPEED_SHARE = 0.15;
const PARTY_SPEED_SECONDS = 15;
const PARTY_SPEED_SOURCE = "jean-constellation-2";
// Constellation 4: each opponent within Dandelion Breeze's field has its Anemo RES cut by 40% for 1.2 seconds, which gcsim
// Gives at the field's start and each of its ticks, so an opponent that leaves the field keeps the cut for those seconds
const ANEMO_RESISTANCE_CONSTELLATION = 4;
const ANEMO_RESISTANCE_REDUCTION = 0.4;
const ANEMO_RESISTANCE_SECONDS = 1.2;
const ANEMO_RESISTANCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "jean-constellation-4",
  resistanceReduction: { [Element.Anemo]: ANEMO_RESISTANCE_REDUCTION },
  secondsRemaining: ANEMO_RESISTANCE_SECONDS,
};

// The Dandelion Field's tick, written for Jean as she cast it, with its heals in HP. Tick 0 is its activation, which heals
// The character on the field by the activation heal and, from Ascension 4, gives Jean back a fifth of the burst's energy.
// Each later tick heals the character on the field by the regeneration. From Constellation 4 each tick also cuts the Anemo
// RES of each opponent within the field
const createFieldTick =
  (owner: Combatant, field: Pick<KitField, "centre" | "radius">, activationHeal: number, regenerationHeal: number) =>
  (context: KitContext, tickIndex: number): void => {
    const isActivation = tickIndex === 0;
    changeKitMemberHealth(
      context,
      owner,
      context.activeCombatant.characterId,
      isActivation ? activationHeal : regenerationHeal,
    );
    if (owner.constellationCount >= ANEMO_RESISTANCE_CONSTELLATION)
      for (const enemy of context.enemyMap.values())
        if (checkIsInKitField(field, enemy.position)) addEnemyStatus(enemy, ANEMO_RESISTANCE_STATUS);
    if (!isActivation || owner.ascension < LET_THE_WIND_LEAD_ASCENSION) return;
    gainPartyMemberEnergy(context.party, owner, LET_THE_WIND_LEAD_ENERGY_SHARE * owner.kit.burstEnergyCost);
  };

export const JEAN_CHARACTER_ID = 10_000_003;

// Jean's behaviour: each strike's hit carries Wind Companion's heal, rolling from Ascension 1. Gale Blade held a second or
// More plays Spiraling Tempest's from one constellation, adding its DMG bonus to her Anemo DMG Bonus for the blast's
// Animation, the hit it lands within. Dandelion Breeze casts its field where she stands, healing the character on it at
// Its activation and each second after, and its entering and exiting damage, priced by her as she stood then
// Constellation 6 needs the 35% incoming DMG cut inside the field and after leaving it, which the kit does not apply
export const createJeanKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const fieldStartSeconds = readSeconds("dandelionFieldStart");
  const fieldSeconds = readSeconds("dandelionFieldEnd") + DANDELION_FIELD_LINGER_SECONDS;
  const fieldRadius = takeOne(kit.elementalBurst.hits).hitArea.radius;
  const fieldDamageHits = readHits("fieldDamage");
  const activationAttackShare = readParameter("activationAttackShare");
  const activationFlatHeal = readParameter("activationFlatHeal");
  const regenerationAttackShare = readParameter("regenerationAttackShare");
  const regenerationFlatHeal = readParameter("regenerationFlatHeal");
  const windCompanionStrike: KitHitBehaviour = {
    healPartyChance: (striker) => (striker.ascension >= WIND_COMPANION_ASCENSION ? WIND_COMPANION_CHANCE : 0),
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: fieldStartSeconds,
          onTick: createFieldTick(
            combatant,
            { centre: position, radius: fieldRadius },
            activationFlatHeal + activationAttackShare * combatant.attributes.attack,
            regenerationFlatHeal + regenerationAttackShare * combatant.attributes.attack,
          ),
          radius: fieldRadius,
          secondsRemaining: fieldSeconds,
          tickIntervalSeconds: DANDELION_FIELD_TICK_INTERVAL_SECONDS,
        });
        castKitSummon(kitEffectState, { facing, height, position }, combatant, fieldDamageHits, {
          secondsRemaining: fieldSeconds,
        });
      },
    },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => windCompanionStrike) })),
    // Constellation 2: Jean's pickup of a particle or orb gives the party Movement SPD and ATK SPD while she is on the field
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.EnergyParticleCollected ||
        combatant.constellationCount < PARTY_SPEED_CONSTELLATION ||
        activeCombatant.characterId !== combatant.characterId
      )
        return;
      for (const attribute of [Attribute.MovementSpeed, Attribute.NormalAttackSpeed])
        buffKitTeam(kitEffectState, party, {
          amount: PARTY_SPEED_SHARE,
          attribute,
          secondsRemaining: PARTY_SPEED_SECONDS,
          source: PARTY_SPEED_SOURCE,
        });
    },
    skillHolds: [
      {
        variant: {
          checkIsActive: ({ activeCombatant: combatant }) =>
            combatant.constellationCount >= SPIRALING_TEMPEST_CONSTELLATION,
          onStart: ({ activeCombatant: combatant, kitEffectState }) =>
            buffKitMember(kitEffectState, combatant.characterId, {
              amount: SPIRALING_TEMPEST_DAMAGE_BONUS,
              attribute: Attribute.AnemoDamageBonus,
              secondsRemaining: kit.elementalSkill.seconds,
            }),
        },
      },
    ],
  };
};
