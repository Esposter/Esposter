import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Jean's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill group holds Gale
// Blade at 0, its hold's longest seconds at 2 and its cooldown at 3. The burst group holds Dandelion Breeze at 0, the
// Field's entering and exiting damage at 1, its activation heal's ATK share and flat HP at 2 and 3, its regeneration's at
// 4 and 5, and the burst's cooldown and energy cost at 6 and 7
const JEAN_ATTACK_GROUP_ID = 331;
const JEAN_SKILL_GROUP_ID = 332;
const JEAN_BURST_GROUP_ID = 339;

// Measured: gcsim v2.47.2 (MIT) jean/attack.go, each strike a circle or a fan centred ahead of or behind the body, so each
// Is priced as its offset plus its radius, or a fan centred behind as its radius less the offset, as Ayaka's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 + 1.5 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: (5 * Math.PI) / 6, height: 2, radius: 2.2 - 0.5 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: Math.PI / 6, height: 2, radius: 2.8 - 1 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.6 });
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.6 });
// Measured: gcsim v2.47.2 (MIT) jean/charge.go, a fan of 160 degrees and radius 1.8 centred a metre ahead
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: (8 * Math.PI) / 9, height: 2, radius: 1 + 1.8 });
// Provisional: gcsim has no plunge file for Jean, so the plunges' reach is Bennett's and Mona's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) jean/skill.go, Gale Blade's box 4 wide and 4.1 long, whose near edge gcsim's rectangle
// Spawns on the body, so it is priced as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/skill.go
const GALE_BLADE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(2, 4.1) });
// Measured: gcsim v2.47.2 (MIT) jean/burst.go, the burst's circle of radius 6 round the body, and the Dandelion Field's,
// Which its entering and exiting damage reach. gcsim centres those on the primary target, which an area does not hold, so
// They are priced round the field, every enemy within it, as the wiki's Dandelion Breeze notes give them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jean/burst.go
const DANDELION_BREEZE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) jean/burst.go, the field from 40 frames to 600 frames past them, its activation heal and
// First entering damage at 40, its regeneration every 60 frames from 100 to its end, and its exiting damage at its end.
// The wiki's Dandelion Breeze notes give the field's 10 seconds and its 10 regenerations. The field's tick 0 is the
// Activation, so a tick falls every second from 40 frames
const DANDELION_FIELD_START_FRAMES = 40;
const DANDELION_FIELD_END_FRAMES = DANDELION_FIELD_START_FRAMES + 600;
const DANDELION_FIELD_TICK_INTERVAL_SECONDS = 1;
// The field and its damage live a tenth of a second past their end, so the step that runs the last tick and lands the
// Exiting damage still has them
const DANDELION_FIELD_SECONDS = DANDELION_FIELD_END_FRAMES / 60 + 0.1;
// Spiraling Tempest, from one constellation, raises Gale Blade's DMG by 40% once it is held over a second, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) jean/cons.go give it, which gcsim's skill.go checks at 60 frames held
// https://genshin-impact.fandom.com/wiki/Spiraling_Tempest
const SPIRALING_TEMPEST_CONSTELLATION = 1;
const SPIRALING_TEMPEST_MINIMUM_HELD_SECONDS = 1;
const SPIRALING_TEMPEST_DAMAGE_BONUS = 0.4;
// Wind Companion, from Ascension 1, gives each normal attack hit a 50% chance to heal every party member by 15% of Jean's
// ATK, as the wiki's passive page and gcsim v2.47.2 (MIT) jean/asc.go give it
// https://genshin-impact.fandom.com/wiki/Wind_Companion
const WIND_COMPANION_HEAL: KitPartyHeal = {
  attackShare: 0.15,
  chance: (striker) => (striker.ascension >= 1 ? 0.5 : 0),
  defenseShare: 0,
  flatHealth: 0,
  isUnshielded: true,
};
// Let the Wind Lead, from Ascension 4, regenerates 20% of Dandelion Breeze's energy as it is used, 16 of its 80, as the
// Wiki's passive page gives it. gcsim v2.47.2 (MIT) jean/asc.go adds it at 41 frames, a frame past the activation
// https://genshin-impact.fandom.com/wiki/Let_the_Wind_Lead
const LET_THE_WIND_LEAD_ENERGY_SHARE = 0.2;

// Jean's strikes are physical unless infused, so none applies a gauge of its own. Each is under a Normal Attack internal
// Cooldown, and its poise is the wiki's Favonius Bladework advanced properties. Each carries Wind Companion's heal
const createNormalAttack = (
  hitArea: AttackArea,
  poiseDamage: number,
  talentMultiplier: number,
  hitmarkFrames: number,
  frames: number,
): KitAction => ({
  hits: [
    {
      healParty: WIND_COMPANION_HEAL,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage,
      talentMultiplier,
    },
  ],
  seconds: frames / 60,
  targetingArea: SWORD_TARGETING_AREA,
});

// The Dandelion Field's tick, written for Jean as she cast it, with its heals in HP. Tick 0 is its activation, which heals
// The character on the field by the activation heal and, from Ascension 4, gives Jean back a fifth of the burst's energy.
// Each later tick heals the character on the field by the regeneration
const createFieldTick =
  (owner: Combatant, activationHeal: number, regenerationHeal: number) =>
  ({ activeCombatant, party, tickIndex }: KitFieldTick): void => {
    const isActivation = tickIndex === 0;
    const heal = isActivation ? activationHeal : regenerationHeal;
    healPartyMember(party, activeCombatant.characterId, heal / activeCombatant.attributes.maxHealth);
    if (!isActivation || owner.ascension < 4) return;
    const partyMember = getPartyMember(party, owner.characterId);
    const { burstEnergyCost } = owner.kit;
    partyMember.energy = Math.min(
      burstEnergyCost,
      partyMember.energy + LET_THE_WIND_LEAD_ENERGY_SHARE * burstEnergyCost,
    );
  };

// Jean's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Gale Blade's press
// And its hold, and Dandelion Breeze with its field and its entering and exiting damage. Its multipliers are read from
// Her proud skill groups
export const createJeanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  // Measured: gcsim v2.47.2 (MIT) jean/skill.go, Gale Blade's blast at 21 frames and the animation's 46, which a hold
  // Starts on its release. The wiki's Gale Blade applies 2U of Anemo with no internal cooldown and 250 poise
  const galeBlade: KitAction = {
    hits: [
      {
        element: Element.Anemo,
        gauge: 2,
        hitArea: GALE_BLADE_HIT_AREA,
        hitmarkSeconds: 21 / 60,
        poiseDamage: 250,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    seconds: 46 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };
  const skillCooldownSeconds = getTalentMultiplier(talentMultiplierMap, JEAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 3);
  // Measured: gcsim v2.47.2 (MIT) jean/attack.go, each strike's hitmark and the animation that ends it at 60 fps
  const normalAttacks = [
    createNormalAttack(
      FIRST_STRIKE_HIT_AREA,
      37.8,
      getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      13,
      25,
    ),
    createNormalAttack(
      SECOND_STRIKE_HIT_AREA,
      35.1,
      getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      6,
      20,
    ),
    createNormalAttack(
      THIRD_STRIKE_HIT_AREA,
      48.6,
      getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      17,
      31,
    ),
    createNormalAttack(
      FOURTH_STRIKE_HIT_AREA,
      54,
      getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      37,
      49,
    ),
    createNormalAttack(
      FIFTH_STRIKE_HIT_AREA,
      60.3,
      getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      25,
      68,
    ),
  ];
  const fieldDamageMultiplier = getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  // The activation heal is 251.2% of Jean's ATK plus 1540 and the regeneration 25.12% plus 154 at level 1, neither scaled
  // By Healing Bonus, as Bennett's is not
  const activationAttackShare = getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 2);
  const activationFlatHeal = getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 3);
  const regenerationAttackShare = getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 4);
  const regenerationFlatHeal = getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 5);
  // The field's entering damage at its activation and its exiting damage at its end, each 2U of Anemo with no internal
  // Cooldown and 50 poise, as the wiki's Dandelion Breeze advanced properties give them
  const fieldDamageHits = [DANDELION_FIELD_START_FRAMES, DANDELION_FIELD_END_FRAMES].map((hitmarkFrames): KitHit => ({
    element: Element.Anemo,
    gauge: 2,
    hitArea: DANDELION_BREEZE_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 50,
    talentMultiplier: fieldDamageMultiplier,
  }));
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 6),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 7),
    // Measured: gcsim v2.47.2 (MIT) jean/charge.go, the hit at 36 frames and the animation's 57. The wiki's Favonius
    // Bladework gives it 200 poise under a Normal Attack internal cooldown, as gcsim's tag does
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_HIT_AREA,
          hitmarkSeconds: 36 / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 200,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: 57 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    // Measured: gcsim v2.47.2 (MIT) jean/burst.go, the blast at 55 frames and the animation's 90. The wiki's Dandelion
    // Breeze applies 2U of Anemo with no internal cooldown and 400 poise. The field and its damage are cast where Jean
    // Stands and priced by her as she stood then
    elementalBurst: {
      hits: [
        {
          element: Element.Anemo,
          gauge: 2,
          hitArea: DANDELION_BREEZE_HIT_AREA,
          hitmarkSeconds: 55 / 60,
          poiseDamage: 400,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: DANDELION_FIELD_START_FRAMES / 60,
          onTick: createFieldTick(
            combatant,
            activationFlatHeal + activationAttackShare * combatant.attributes.attack,
            regenerationFlatHeal + regenerationAttackShare * combatant.attributes.attack,
          ),
          radius: DANDELION_BREEZE_HIT_AREA.radius,
          secondsRemaining: DANDELION_FIELD_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: DANDELION_FIELD_TICK_INTERVAL_SECONDS,
        });
        addKitEffect(kitEffectState, {
          body: { facing, height, position: { x: position.x, z: position.z } },
          combatant,
          elapsedSeconds: 0,
          hits: fieldDamageHits,
          kind: "summon",
          secondsRemaining: DANDELION_FIELD_SECONDS,
        });
      },
      seconds: 90 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: galeBlade,
    // Held a second or more, Gale Blade plays Spiraling Tempest's from one constellation, which adds its DMG bonus to
    // Jean's Anemo DMG Bonus for the blast's animation, the hit it lands within
    elementalSkillHolds: [
      {
        action: galeBlade,
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: SPIRALING_TEMPEST_MINIMUM_HELD_SECONDS,
        variant: {
          action: {
            ...galeBlade,
            onStart: ({ combatant, kitEffectState }) =>
              addKitEffect(kitEffectState, {
                amount: SPIRALING_TEMPEST_DAMAGE_BONUS,
                attribute: Attribute.AnemoDamageBonus,
                characterId: combatant.characterId,
                kind: "buff",
                secondsRemaining: galeBlade.seconds,
              }),
          },
          checkIsActive: ({ combatant }) => combatant.constellationCount >= SPIRALING_TEMPEST_CONSTELLATION,
        },
      },
    ],
    // The wiki's and the group's 5 seconds, which gcsim's 300 frames cap the hold at too
    elementalSkillMaximumHeldSeconds: getTalentMultiplier(
      talentMultiplierMap,
      JEAN_SKILL_GROUP_ID,
      TALENT_START_LEVEL,
      2,
    ),
    // Provisional: no source gives Jean's plunges' landing frames, so each hits as its action starts, as Mona's do. The
    // Wiki's Favonius Bladework gives them 100 and 150 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 0.4,
      targetingArea: SWORD_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: 0.4,
      targetingArea: SWORD_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, JEAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    // The group's, the wiki's and the skill table's 6 seconds, which gcsim's 360 frames give too
    skillCooldownSeconds,
  };
};
