import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Bennett's proud skill groups, read at its talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's two hits at 5 and 6 and its stamina at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill
// Group holds the press at 0, and the burst group's Fantastic Voyage holds its damage at 0, the field's heal as a share
// Of Bennett's Max HP at 1 and as flat HP at 2, the ATK bonus as a share of its base ATK at 3, and the field's duration at 4
const BENNETT_ATTACK_GROUP_ID = 3231;
const BENNETT_SKILL_GROUP_ID = 3232;
const BENNETT_BURST_GROUP_ID = 3239;

// Measured: gcsim v2.47.2 (MIT) bennett/attack.go, the strikes' reach: circles of radius 1.2 and 1.2, a fan of 30 degrees
// And radius 2, a box offset 0.3 metres ahead and 3.5 long and 1 wide, and a circle of radius 2. The box is priced as the
// Circle to its farthest corner, provisional, as the other boxes are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/attack.go
const SWORD_CIRCLE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.2 });
const STRIKE_FAN_HIT_AREA: AttackArea = Object.freeze({ angle: Math.PI / 6, height: 2, radius: 2 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.1 });
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });
// Measured: gcsim v2.47.2 (MIT) bennett/charge.go, the charged attack's two circles of radius 2.2
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.2 });
// Measured: gcsim v2.47.2 (MIT) bennett/plunge.go, the collision a circle of radius 1, the low plunge's 3 and the high's 5
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) bennett/skill.go, the press as a fan of 270 degrees and radius 2.5
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/skill.go
const PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: (3 * Math.PI) / 2, height: 2, radius: 2.5 });
// Measured: gcsim v2.47.2 (MIT) bennett/burst.go, Fantastic Voyage's circle of radius 6
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
// Measured: gcsim v2.47.2 (MIT) bennett/skill.go, Passion Overload's hold hits: a circle of radius 2.5 at 0.5 metres
// Ahead for the first, a box of 3 by 3 at the body for the second, and the Level 2 explosion's circle of radius 3.5 at
// One metre ahead. Each reach is its offset plus its radius, and the box is priced as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/skill.go
const CHARGE_FIRST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const CHARGE_SECOND_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(1.5, 1.5),
});
const CHARGE_EXPLOSION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4.5 });
// Provisional: the reach the targeting reads for the skill and burst, as the Traveler's are, until the wiki gives them
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) bennett/burst.go, the field's first tick at 34 frames and then every second to its end,
// Its heal below 70% and its ATK bonus above it, of the character's HP, and the buffs of 126 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go
const BENNETT_FIELD_FIRST_TICK_SECONDS = 34 / 60;
const BENNETT_FIELD_TICK_INTERVAL_SECONDS = 1;
const BENNETT_FIELD_RADIUS = 6;
const BENNETT_FIELD_HP_THRESHOLD = 0.7;
const BENNETT_FIELD_BUFF_SECONDS = 126 / 60;
// The field's life runs from the burst's start to its duration past the first tick
const BENNETT_BURST_START_SECONDS = 34 / 60;

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
const FIRE_VENTURES_INFUSED_WEAPON_TYPES = new Set<WeaponType>([
  WeaponType.Claymore,
  WeaponType.Polearm,
  WeaponType.Sword,
]);

// Measured: the wiki's Passion Overload page, the press's cooldown of 5 seconds and the hold's of 7.5 and 10 seconds
// https://genshin-impact.fandom.com/wiki/Passion_Overload
const BENNETT_PRESS_COOLDOWN_SECONDS = 5;
const BENNETT_CHARGE_LEVEL_1_COOLDOWN_SECONDS = 7.5;
const BENNETT_CHARGE_LEVEL_2_COOLDOWN_SECONDS = 10;
// Measured: gcsim v2.47.2 (MIT) bennett/skill.go, the Level 1 hold's two hits at 45 and 57 frames and its animation of 98
// Frames, and the Level 2 hold's two hits at 112 and 121 frames, its explosion at 166 and its animation of 343 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/skill.go
const CHARGE_LEVEL_1_FIRST_HITMARK_SECONDS = 45 / 60;
const CHARGE_LEVEL_1_SECOND_HITMARK_SECONDS = 57 / 60;
const CHARGE_LEVEL_2_FIRST_HITMARK_SECONDS = 112 / 60;
const CHARGE_LEVEL_2_SECOND_HITMARK_SECONDS = 121 / 60;
const CHARGE_LEVEL_2_EXPLOSION_HITMARK_SECONDS = 166 / 60;
const CHARGE_LEVEL_1_SECONDS = 98 / 60;
const CHARGE_LEVEL_2_SECONDS = 343 / 60;
// Measured: gcsim v2.47.2 (MIT) bennett/skill.go, the Level 2 hold's animation under Fearnaught, 175 frames, without the
// Launch: its hits and explosion are the same, all of them landing before the animation ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/skill.go
const CHARGE_LEVEL_2_NO_LAUNCH_SECONDS = 175 / 60;
// Provisional: the seconds a skill is held to reach each Charge Level, which no table or wiki page gives. The roadmap's
// Recordings owed list holds the entry that measures them, `bennett-charge-levels.mkv`
const CHARGE_LEVEL_1_MINIMUM_HELD_SECONDS = 0.5;
const CHARGE_LEVEL_2_MINIMUM_HELD_SECONDS = 1;

// A kit's normal attacks, charged attack and plunges are physical, so none of them applies a gauge unless infused. Their
// Poise is the wiki's Strike of Fortune advanced properties, and their blunt is none
const createNormalAttack = (
  hitArea: AttackArea,
  poiseDamage: number,
  talentMultiplier: number,
  hitmarkSeconds: number,
  seconds: number,
): KitAction => ({
  hits: [
    { hitArea, hitmarkSeconds, internalCooldownTag: InternalCooldownTag.NormalAttack, poiseDamage, talentMultiplier },
  ],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Passion Overload's Level 1 and Level 2 hold's hits, at their talent multipliers, each Charge Level hit dealing 1U of Pyro
// Measured: the wiki's Passion Overload page, the Charge Level hits' multipliers at group indices 1 to 4 and the explosion
// At index 5, and their poise of 100 and the explosion's 250, from its advanced properties
const createChargeLevel1 = (talentMultiplierMap: TalentMultiplierMap): KitAction => ({
  hits: [
    {
      element: Element.Pyro,
      gauge: 1,
      hitArea: CHARGE_FIRST_HIT_AREA,
      hitmarkSeconds: CHARGE_LEVEL_1_FIRST_HITMARK_SECONDS,
      poiseDamage: 100,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
    },
    {
      element: Element.Pyro,
      gauge: 1,
      hitArea: CHARGE_SECOND_HIT_AREA,
      hitmarkSeconds: CHARGE_LEVEL_1_SECOND_HITMARK_SECONDS,
      poiseDamage: 100,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
    },
  ],
  seconds: CHARGE_LEVEL_1_SECONDS,
  targetingArea: SKILL_TARGETING_AREA,
});

const createChargeLevel2 = (talentMultiplierMap: TalentMultiplierMap): KitAction => ({
  hits: [
    {
      element: Element.Pyro,
      gauge: 1,
      hitArea: CHARGE_FIRST_HIT_AREA,
      hitmarkSeconds: CHARGE_LEVEL_2_FIRST_HITMARK_SECONDS,
      poiseDamage: 100,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
    },
    {
      element: Element.Pyro,
      gauge: 1,
      hitArea: CHARGE_SECOND_HIT_AREA,
      hitmarkSeconds: CHARGE_LEVEL_2_SECOND_HITMARK_SECONDS,
      poiseDamage: 100,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
    },
    {
      element: Element.Pyro,
      gauge: 1,
      hitArea: CHARGE_EXPLOSION_HIT_AREA,
      hitmarkSeconds: CHARGE_LEVEL_2_EXPLOSION_HITMARK_SECONDS,
      poiseDamage: 250,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 5),
    },
  ],
  seconds: CHARGE_LEVEL_2_SECONDS,
  targetingArea: SKILL_TARGETING_AREA,
});

// Whether Bennett stands in a field of his own at Ascension 4, the condition Fearnaught's two effects read: Passion
// Overload's cooldown is halved, and Bennett is not launched by the Level 2 explosion
const checkIsFearnaughtActive = ({ body, combatant, kitEffectState }: KitStepContext): boolean =>
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
const getSkillCooldownMultiplier = (context: KitStepContext): number => {
  let multiplier = 1;
  if (context.combatant.ascension >= 1) multiplier *= 0.8;
  if (checkIsFearnaughtActive(context)) multiplier *= 0.5;
  return multiplier;
};

// The field's tick, written for the character who cast it. From the second tick a character under 70% of its HP is healed
// By 577 plus 6% of Bennett's Max HP. One above 70% gains an ATK bonus of 56% of Bennett's base ATK, which Grand Expectation
// Lifts to any HP above zero and adds 20% to. From Fire Ventures With Me, that bonus also gives the character on the field
// A 15% Pyro DMG Bonus, and Pyro on its weapon if it wields a sword, claymore or polearm, all for 2.1 seconds. The heal's
// Healing Bonus is not read
const createFieldTick =
  (talentMultiplierMap: TalentMultiplierMap, owner: Combatant) =>
  ({ activeCombatant, kitEffectState, party, tickIndex }: KitFieldTick): void => {
    const { characterId, weaponType } = activeCombatant;
    const { healthShare } = getPartyMember(party, characterId);
    const flatHeal = getTalentMultiplier(talentMultiplierMap, BENNETT_BURST_GROUP_ID, TALENT_START_LEVEL, 2);
    const maxHealthHeal = getTalentMultiplier(talentMultiplierMap, BENNETT_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
    if (tickIndex > 0 && healthShare < BENNETT_FIELD_HP_THRESHOLD) {
      const heal = flatHeal + maxHealthHeal * owner.attributes.maxHealth;
      healPartyMember(party, characterId, heal / activeCombatant.attributes.maxHealth);
    }
    const hasGrandExpectation = owner.constellationCount >= GRAND_EXPECTATION_CONSTELLATION;
    if (healthShare > (hasGrandExpectation ? 0 : BENNETT_FIELD_HP_THRESHOLD)) {
      addKitEffect(kitEffectState, {
        amount:
          (getTalentMultiplier(talentMultiplierMap, BENNETT_BURST_GROUP_ID, TALENT_START_LEVEL, 3) +
            (hasGrandExpectation ? GRAND_EXPECTATION_BASE_ATTACK_SHARE : 0)) *
          owner.attributes.attributeTotalMap[Attribute.BaseAttack],
        attribute: Attribute.Attack,
        characterId,
        kind: "buff",
        secondsRemaining: BENNETT_FIELD_BUFF_SECONDS,
      });
      if (owner.constellationCount >= FIRE_VENTURES_WITH_ME_CONSTELLATION) {
        addKitEffect(kitEffectState, {
          amount: FIRE_VENTURES_PYRO_DAMAGE_BONUS,
          attribute: Attribute.PyroDamageBonus,
          characterId,
          kind: "buff",
          secondsRemaining: BENNETT_FIELD_BUFF_SECONDS,
        });
        if (weaponType !== undefined && FIRE_VENTURES_INFUSED_WEAPON_TYPES.has(weaponType))
          addKitEffect(kitEffectState, {
            characterId,
            element: Element.Pyro,
            kind: "infusion",
            secondsRemaining: BENNETT_FIELD_BUFF_SECONDS,
          });
      }
    }
  };

// Bennett's kit at talent level 1: five strikes, a charged attack, a collision and two plunges, Passion Overload's press
// And its two Charge Levels, and Fantastic Voyage. Its multipliers are read from its proud skill groups
export const createBennettKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 15,
  burstEnergyCost: 60,
  chargedAttack: {
    hits: [
      {
        hitArea: CHARGED_HIT_AREA,
        hitmarkSeconds: 10 / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 45,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
      },
      {
        hitArea: CHARGED_HIT_AREA,
        hitmarkSeconds: 21 / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 45,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      },
    ],
    seconds: 55 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  // The wiki's Strike of Fortune stamina, which its paramList row gives as well
  chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
  // Measured: gcsim v2.47.2 (MIT) bennett/burst.go, the damage at 37 frames and the cancel frame at 53. The wiki's
  // Fantastic Voyage damage is 2U of Pyro with 200 poise, and it carries no internal cooldown
  elementalBurst: {
    hits: [
      {
        element: Element.Pyro,
        gauge: 2,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: 37 / 60,
        poiseDamage: 200,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    onStart: ({ body, combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        centre: { x: body.position.x, z: body.position.z },
        characterId: combatant.characterId,
        kind: "field",
        nextTickSeconds: BENNETT_FIELD_FIRST_TICK_SECONDS,
        onTick: createFieldTick(talentMultiplierMap, combatant),
        radius: BENNETT_FIELD_RADIUS,
        secondsRemaining:
          getTalentMultiplier(talentMultiplierMap, BENNETT_BURST_GROUP_ID, TALENT_START_LEVEL, 4) +
          BENNETT_BURST_START_SECONDS,
        tickIndex: 0,
        tickIntervalSeconds: BENNETT_FIELD_TICK_INTERVAL_SECONDS,
      }),
    seconds: 53 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) bennett/skill.go, the press at 16 frames and its cancel frame at 42. Its gauge is the
  // Wiki's 2U of Pyro, with no internal cooldown
  elementalSkill: {
    hits: [
      {
        element: Element.Pyro,
        gauge: 2,
        hitArea: PRESS_HIT_AREA,
        hitmarkSeconds: 16 / 60,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    seconds: 42 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Held past each minimum and released, the skill plays that Charge Level, ordered by their minimum seconds
  elementalSkillHolds: [
    {
      action: createChargeLevel1(talentMultiplierMap),
      cooldownSeconds: BENNETT_CHARGE_LEVEL_1_COOLDOWN_SECONDS,
      minimumHeldSeconds: CHARGE_LEVEL_1_MINIMUM_HELD_SECONDS,
    },
    {
      action: createChargeLevel2(talentMultiplierMap),
      cooldownSeconds: BENNETT_CHARGE_LEVEL_2_COOLDOWN_SECONDS,
      minimumHeldSeconds: CHARGE_LEVEL_2_MINIMUM_HELD_SECONDS,
      variant: {
        action: { ...createChargeLevel2(talentMultiplierMap), seconds: CHARGE_LEVEL_2_NO_LAUNCH_SECONDS },
        checkIsActive: checkIsFearnaughtActive,
      },
    },
  ],
  getSkillCooldownMultiplier,
  highPlunge: {
    hits: [
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 38 / 60,
        isBlunt: true,
        poiseDamage: 150,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
      },
    ],
    seconds: 68 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 36 / 60,
        isBlunt: true,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
      },
    ],
    seconds: 67 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(
      SWORD_CIRCLE_HIT_AREA,
      38.7,
      getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      13 / 60,
      33 / 60,
    ),
    createNormalAttack(
      SWORD_CIRCLE_HIT_AREA,
      37.8,
      getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      9 / 60,
      27 / 60,
    ),
    createNormalAttack(
      STRIKE_FAN_HIT_AREA,
      47.7,
      getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      13 / 60,
      46 / 60,
    ),
    createNormalAttack(
      FOURTH_STRIKE_HIT_AREA,
      52.2,
      getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      25 / 60,
      48 / 60,
    ),
    createNormalAttack(
      FIFTH_STRIKE_HIT_AREA,
      62.1,
      getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      24 / 60,
      60 / 60,
    ),
  ],
  // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
  plungeCollision: {
    gauge: 0,
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 25,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, BENNETT_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
  },
  skillCooldownSeconds: BENNETT_PRESS_COOLDOWN_SECONDS,
});
