import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
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

// The Dandelion Field's tick, written for Jean as she cast it, with its heals in HP. Tick 0 is its activation, which heals
// The character on the field by the activation heal and, from Ascension 4, gives Jean back a fifth of the burst's energy.
// Each later tick heals the character on the field by the regeneration
const createFieldTick =
  (owner: Combatant, activationHeal: number, regenerationHeal: number) =>
  (context: KitContext, tickIndex: number): void => {
    const isActivation = tickIndex === 0;
    changeKitMemberHealth(
      context,
      owner,
      context.activeCombatant.characterId,
      isActivation ? activationHeal : regenerationHeal,
    );
    if (!isActivation || owner.ascension < LET_THE_WIND_LEAD_ASCENSION) return;
    gainPartyMemberEnergy(context.party, owner, LET_THE_WIND_LEAD_ENERGY_SHARE * owner.kit.burstEnergyCost);
  };

export const JEAN_CHARACTER_ID = 10_000_003;

// Jean's behaviour: each strike's hit carries Wind Companion's heal, rolling from Ascension 1. Gale Blade held a second or
// More plays Spiraling Tempest's from one constellation, adding its DMG bonus to her Anemo DMG Bonus for the blast's
// Animation, the hit it lands within. Dandelion Breeze casts its field where she stands, healing the character on it at
// Its activation and each second after, and its entering and exiting damage, priced by her as she stood then
// Constellation 2 needs Movement SPD and ATK SPD buffs for the party on each orb or particle Jean picks up
// Constellation 4 needs the Anemo RES cut on enemies inside Dandelion Breeze's field, which the field does not apply
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
