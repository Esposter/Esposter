import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { MELEE_WEAPON_TYPES } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) bennett/burst.go, the field's ticks every second to its end, its circle of radius 6, and
// Its heal below 70% and its ATK bonus above it, of the character's HP
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go
const BENNETT_FIELD_TICK_INTERVAL_SECONDS = 1;
const BENNETT_FIELD_RADIUS = 6;
const BENNETT_FIELD_HP_THRESHOLD = 0.7;

// Grand Expectation at constellation 1 lifts the ATK bonus's HP threshold to any HP above zero, and adds 20% of Bennett's
// Base ATK to it. Measured: gcsim v2.47.2 (MIT) bennett/burst.go, the `pc += 0.2` and the threshold of 0 at Cons 1
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go
const GRAND_EXPECTATION_CONSTELLATION = 1;
const GRAND_EXPECTATION_BASE_ATTACK_SHARE = 0.2;
// Fire Ventures With Me at constellation 6 gives the character on the field a 15% Pyro DMG Bonus, whatever it wields, and
// Pyro on its weapon if it wields a sword, claymore or polearm. Measured: gcsim v2.47.2 (MIT) bennett/burst.go, the PyroP
// Of 0.15 outside the weapon switch and the infusion within it. The wiki's note gives the same wielders
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go
// https://genshin-impact.fandom.com/wiki/Fire_Ventures_With_Me
const FIRE_VENTURES_WITH_ME_CONSTELLATION = 6;
const FIRE_VENTURES_PYRO_DAMAGE_BONUS = 0.15;

// Whether Bennett stands in a field of his own at Ascension 4, the condition Fearnaught's two effects read: Passion
// Overload's cooldown is halved, and Bennett is not launched by the Level 2 explosion
const checkIsFearnaughtActive = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): boolean =>
  combatant.ascension >= 4 &&
  kitEffectState.effects.some(
    (effect) =>
      effect.kind === "field" &&
      effect.characterId === combatant.characterId &&
      checkIsInKitField(effect, body.position),
  );

// Fantastic Voyage's field lowers Passion Overload's cooldown by half at Ascension 4 for Bennett standing in it, and
// Ascension 1 lowers every Passion Overload's cooldown by 20%
// Measured: gcsim v2.47.2 (MIT) bennett/asc.go, the A1 factor of 0.8 and the A4 factor of 0.5 within the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/asc.go
const getSkillCooldownMultiplier = (context: KitContext): number => {
  let multiplier = 1;
  if (context.activeCombatant.ascension >= 1) multiplier *= 0.8;
  if (checkIsFearnaughtActive(context)) multiplier *= 0.5;
  return multiplier;
};

export const BENNETT_CHARACTER_ID = 10_000_032;

// Impasse Conqueror at constellation 2 raises Energy Recharge by 30% while Bennett's HP is under 70% of its Max HP, and not
// From 70% up. As the wiki's constellation table gives it: https://genshin-impact.fandom.com/wiki/Bennett
const IMPASSE_CONQUEROR_CONSTELLATION = 2;
const IMPASSE_CONQUEROR_ENERGY_RECHARGE = 0.3;
const IMPASSE_CONQUEROR_HP_THRESHOLD = 0.7;
// Impasse Conqueror's Energy Recharge, read off the HP share a passive is given, as the character stands
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.constellationCount >= IMPASSE_CONQUEROR_CONSTELLATION && healthShare < IMPASSE_CONQUEROR_HP_THRESHOLD
    ? [{ amount: IMPASSE_CONQUEROR_ENERGY_RECHARGE, attribute: Attribute.EnergyRecharge }]
    : [];

// Bennett's behaviour: Fantastic Voyage casts its field where he stands, from its start to the table's seconds past its
// First tick. Each tick, from the second, heals the character on it under 70% of its HP by the table's flat HP and share
// Of Bennett's Max HP, and gives one above 70% the table's share of Bennett's base ATK, which Grand Expectation lifts to
// Any HP above zero and adds 20% to. From Fire Ventures With Me, that bonus also gives the character on the field a 15%
// Pyro DMG Bonus, and Pyro on its weapon if it wields a sword, claymore or polearm. Under his own field at Ascension 4,
// The Level 2 hold plays without the launch, and Passion Overload's cooldown is cut from Ascension 1 and halved there
// Constellation 4 is not built: getNormalAttackExtraHit is handed only the hit a normal attack lands, not its place in the
// Chain, so the second attack of Passion Overload's Level 1 cannot be told from the others, and the Level 1 hold's release
// State is not carried by the kit
export const createBennettKitBehaviour = ({ readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const fieldFlatHeal = readParameter("fantasticVoyageFlatHeal");
  const fieldMaxHealthHealShare = readParameter("fantasticVoyageMaxHealthHealShare");
  const fieldBaseAttackShare = readParameter("fantasticVoyageBaseAttackShare");
  const fieldSeconds = readParameter("fantasticVoyageFieldSeconds");
  const fieldStartSeconds = readSeconds("fantasticVoyageFieldStart");
  const fieldFirstTickSeconds = readSeconds("fantasticVoyageFieldFirstTick");
  const fieldBuffSeconds = readSeconds("fantasticVoyageFieldBuff");
  // The field's tick, written for the character who cast it
  const createFieldTick =
    (owner: Combatant) =>
    (context: KitContext, tickIndex: number): void => {
      const { activeCombatant, kitEffectState, party } = context;
      const { characterId, weaponType } = activeCombatant;
      const { healthShare } = getPartyMember(party, characterId);
      if (tickIndex > 0 && healthShare < BENNETT_FIELD_HP_THRESHOLD)
        changeKitMemberHealth(
          context,
          owner,
          characterId,
          fieldFlatHeal + fieldMaxHealthHealShare * owner.attributes.maxHealth,
        );
      const hasGrandExpectation = owner.constellationCount >= GRAND_EXPECTATION_CONSTELLATION;
      if (healthShare <= (hasGrandExpectation ? 0 : BENNETT_FIELD_HP_THRESHOLD)) return;
      buffKitMember(kitEffectState, characterId, {
        amount:
          (fieldBaseAttackShare + (hasGrandExpectation ? GRAND_EXPECTATION_BASE_ATTACK_SHARE : 0)) *
          owner.attributes.attributeTotalMap[Attribute.BaseAttack],
        attribute: Attribute.Attack,
        secondsRemaining: fieldBuffSeconds,
      });
      if (owner.constellationCount < FIRE_VENTURES_WITH_ME_CONSTELLATION) return;
      buffKitMember(kitEffectState, characterId, {
        amount: FIRE_VENTURES_PYRO_DAMAGE_BONUS,
        attribute: Attribute.PyroDamageBonus,
        secondsRemaining: fieldBuffSeconds,
      });
      if (weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType))
        addKitEffect(kitEffectState, {
          characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining: fieldBuffSeconds,
        });
    };
  return {
    getPassiveBonuses,
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: fieldFirstTickSeconds,
          onTick: createFieldTick(combatant),
          radius: BENNETT_FIELD_RADIUS,
          secondsRemaining: fieldSeconds + fieldStartSeconds,
          tickIntervalSeconds: BENNETT_FIELD_TICK_INTERVAL_SECONDS,
        }),
    },
    getSkillCooldownMultiplier,
    skillHolds: [{}, { variant: { checkIsActive: checkIsFearnaughtActive } }],
  };
};
