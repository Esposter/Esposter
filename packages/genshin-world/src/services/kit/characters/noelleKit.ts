import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Noelle's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's cyclic and final hits at 4 and 5 and its stamina at 6, and the plunges' collision, low and high at 8, 9 and 10.
// The skill group holds Breastplate's damage at 5, its shield's share of DEF at 0 and its flat HP at 6, and its duration
// At 3. The burst group holds Sweeping Time's burst at 0, its skill at 1 and its ATK bonus as a share of DEF at 2, its
// Duration at 3
const NOELLE_ATTACK_GROUP_ID = 3431;
const NOELLE_SKILL_GROUP_ID = 3432;
const NOELLE_BURST_GROUP_ID = 3439;

// Measured: gcsim v2.47.2 (MIT) noelle/attack.go, charge.go, plunge.go and skill.go. Each reach is a circle or box centred a
// Metre or so ahead of the body, so each is priced as its far reach from the body until an area holds an offset
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/noelle/attack.go
const createCircleReach = (offset: number, radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: offset + radius });
const createBoxReach = (offset: number, width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(offset + length, width / 2) });
const FIRST_STRIKE_HIT_AREA = createCircleReach(1, 2);
const FOURTH_STRIKE_HIT_AREA = createBoxReach(-1, 2, 3);
const CYCLIC_HIT_AREA = createBoxReach(0.3, 3, 3.5);
const FINAL_SLASH_HIT_AREA = createBoxReach(0, 5, 5.5);
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
// Measured: gcsim v2.47.2 (MIT) noelle/skill.go, Breastplate's circle of radius 2 round Noelle
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/noelle/skill.go
const BREASTPLATE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });
// Measured: gcsim v2.47.2 (MIT) noelle/burst.go, Sweeping Time's circles of radius 6.5 and 4 round Noelle
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/noelle/burst.go
const SWEEPING_TIME_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6.5 });
const SWEEPING_TIME_SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) noelle/burst.go, the buffs last 900 frames from an 80-frame start, which is the table's
// Duration of 15 seconds and that start
const SWEEPING_TIME_START_SECONDS = 80 / 60;

// Breastplate's constellations, gated on the level the save holds: I Got Your Back at 1 makes its heal certain while
// Sweeping Time is up, and To Be Cleaned at 4 explodes the shield for 400% of Noelle's ATK as it ends. The wiki gives the
// Explosion's gauge and poise in its advanced properties, and no area, so it reaches as far as the shield does
// https://genshin-impact.fandom.com/wiki/I_Got_Your_Back and https://genshin-impact.fandom.com/wiki/To_Be_Cleaned
const I_GOT_YOUR_BACK_CONSTELLATION = 1;
const TO_BE_CLEANED_CONSTELLATION = 4;
const TO_BE_CLEANED_HIT: KitHit = {
  element: Element.Geo,
  gauge: 2,
  hitArea: BREASTPLATE_HIT_AREA,
  hitmarkSeconds: 0,
  internalCooldownTag: InternalCooldownTag.ElementalSkill,
  isBlunt: true,
  poiseDamage: 100,
  talentMultiplier: 4,
};

// Noelle's hits are physical and blunt, so none applies a gauge unless infused. Their poise is the wiki's Favonius
// Bladework advanced properties
const createNormalAttack = (
  hitArea: AttackArea,
  hitmarkSeconds: number,
  talentMultiplier: number,
  poiseDamage: number,
  seconds: number,
  healParty: KitPartyHeal,
  convertedPoiseDamage: number,
): KitAction => ({
  hits: [{ convertedPoiseDamage, healParty, hitArea, hitmarkSeconds, isBlunt: true, poiseDamage, talentMultiplier }],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Breastplate's heal on a hit of Noelle's attacks and her press while the shield stands: a 50% roll whose heal is 21.28%
// Of her DEF plus 102.7 HP to the party. Measured: gcsim v2.47.2 (MIT) noelle/skill.go, the chance, share and flat
// Heal at the skill group's indices, and the wiki's Breastplate page gives 50% and 21.3% plus 103 at level 1
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/noelle/skill.go
const createBreastplateHeal = (talentMultiplierMap: TalentMultiplierMap): KitPartyHeal => {
  const chance = getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 2);
  return {
    // Sweeping Time's Geo infusion is up on Noelle while her burst's effects stand, which I Got Your Back's chance reads
    chance: (striker, effects) =>
      striker.constellationCount >= I_GOT_YOUR_BACK_CONSTELLATION &&
      effects.some(
        (effect) =>
          effect.kind === "infusion" && effect.characterId === striker.characterId && effect.element === Element.Geo,
      )
        ? 1
        : chance,
    defenseShare: getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
    flatHealth: getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 7),
  };
};

// Noelle's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Breastplate and
// Sweeping Time. Its multipliers are read from its proud skill groups. Breastplate's heal and its C1 and C4 are built,
// Gated on the constellations the combatant holds, and A1's and A4's effects are not, so the charged attack is one cycle
// Of its spin and its final slash
export const createNoelleKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const breastplateHeal = createBreastplateHeal(talentMultiplierMap);
  return {
    burstCooldownSeconds: 15,
    burstEnergyCost: 60,
    // Measured: gcsim v2.47.2 (MIT) noelle/charge.go, the cyclic slash at 23 frames and the final at 62, its animation 144.
    // The wiki's charged attack has a cyclic slash of 60 poise and a final one of 120, both physical and blunt
    chargedAttack: {
      hits: [
        {
          healParty: breastplateHeal,
          hitArea: CYCLIC_HIT_AREA,
          hitmarkSeconds: 23 / 60,
          isBlunt: true,
          poiseDamage: 60,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
        },
        {
          healParty: breastplateHeal,
          hitArea: FINAL_SLASH_HIT_AREA,
          hitmarkSeconds: 62 / 60,
          isBlunt: true,
          poiseDamage: 120,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: 144 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    // Measured: gcsim v2.47.2 (MIT) noelle/burst.go, the burst's slash at 24 frames, the skill at 65 and the cancel at 121.
    // Both hits are Geo under an Elemental Burst internal cooldown, with 150 poise and blunt, as the wiki gives them
    elementalBurst: {
      hits: [
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: SWEEPING_TIME_HIT_AREA,
          hitmarkSeconds: 24 / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: SWEEPING_TIME_SKILL_HIT_AREA,
          hitmarkSeconds: 65 / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
        },
      ],
      onStart: ({ combatant, kitEffectState }) => {
        const seconds =
          getTalentMultiplier(talentMultiplierMap, NOELLE_BURST_GROUP_ID, TALENT_START_LEVEL, 3) +
          SWEEPING_TIME_START_SECONDS;
        addKitEffect(kitEffectState, {
          amount:
            getTalentMultiplier(talentMultiplierMap, NOELLE_BURST_GROUP_ID, TALENT_START_LEVEL, 2) *
            combatant.attributes.defense,
          attribute: Attribute.Attack,
          characterId: combatant.characterId,
          kind: "buff",
          secondsRemaining: seconds,
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Geo,
          isConverted: true,
          kind: "infusion",
          secondsRemaining: seconds,
        });
      },
      seconds: 121 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) noelle/skill.go, Breastplate's hit at 14 frames and its cancel at 78. The shield is set
    // At the press, from Noelle's DEF, for 12 seconds
    elementalSkill: {
      hits: [
        {
          element: Element.Geo,
          gauge: 2,
          healParty: breastplateHeal,
          hitArea: BREASTPLATE_HIT_AREA,
          hitmarkSeconds: 14 / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      onStart: ({ combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Geo,
          // To Be Cleaned's explosion is priced by Noelle as she stood when she cast the shield, and lands on the character on
          // The field as the shield ends, whoever holds it then
          ...(combatant.constellationCount >= TO_BE_CLEANED_CONSTELLATION && {
            explosion: { combatant, hit: TO_BE_CLEANED_HIT },
          }),
          health:
            getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 6) +
            getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 0) *
              combatant.attributes.defense,
          kind: "shield",
          secondsRemaining: getTalentMultiplier(talentMultiplierMap, NOELLE_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
        }),
      seconds: 78 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 42 / 60,
          isBlunt: true,
          poiseDamage: 200,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 82 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 39 / 60,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 80 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    normalAttacks: [
      createNormalAttack(
        FIRST_STRIKE_HIT_AREA,
        27 / 60,
        getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
        105.8,
        54 / 60,
        breastplateHeal,
        132.25,
      ),
      createNormalAttack(
        FIRST_STRIKE_HIT_AREA,
        24 / 60,
        getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
        98.1,
        66 / 60,
        breastplateHeal,
        122.82,
      ),
      createNormalAttack(
        FIRST_STRIKE_HIT_AREA,
        19 / 60,
        getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
        115.34,
        72 / 60,
        breastplateHeal,
        143.865,
      ),
      createNormalAttack(
        FOURTH_STRIKE_HIT_AREA,
        41 / 60,
        getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
        151.68,
        112 / 60,
        breastplateHeal,
        189.75,
      ),
    ],
    // The collision's poise is the wiki's 35, and it applies no gauge, as the wiki's table gives
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 35,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, NOELLE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    skillCooldownSeconds: 24,
  };
};
