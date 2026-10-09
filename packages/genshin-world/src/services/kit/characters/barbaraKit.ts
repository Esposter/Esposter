import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Barbara's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the
// Charged attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group
// Holds the Melody Loop's regeneration as a share of her Max HP and as flat HP at 0 and 1, its heal on each hit's at 2
// And 3, the droplets at 4, the loop's duration at 5 and the skill's cooldown at 6. The burst group holds Shining
// Miracle's heal as a share of her Max HP and as flat HP at 0 and 1, and the burst's cooldown and energy cost at 2
// And 3
const BARBARA_ATTACK_GROUP_ID = 1431;
const BARBARA_SKILL_GROUP_ID = 1432;
const BARBARA_BURST_GROUP_ID = 1439;

// Measured: gcsim v2.47.2 (MIT) barbara/attack.go, the strikes' circles of radius 1, 1, 1 and 2. gcsim centres them on
// The primary target, which an area does not hold, so they are priced round the body, as Mona's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });
// Measured: gcsim v2.47.2 (MIT) barbara/charge.go, the charged attack's circle of radius 3 centred 5 metres ahead,
// Priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 + 3 });
// Measured: gcsim v2.47.2 (MIT) barbara/plunge.go, the collision a circle of radius 1.5, and the low and high plunges'
// Of 3 and 3.5, each round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) barbara/skill.go, each droplet a circle of radius 3 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/skill.go
const DROPLET_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) barbara/skill.go, the two droplets at 42 and 78 frames, which the wiki's Let the Show
// Begin♪ notes give as two instances of damage at the start of the skill
const DROPLET_HITMARK_FRAMES = [42, 78];
// Measured: gcsim v2.47.2 (MIT) barbara/skill.go, the Melody Loop starting 3 frames into the skill for its duration and
// A frame, its regeneration on the character on the field as it starts and every 5 seconds after, the four heals the
// Wiki's Let the Show Begin♪ notes give
const MELODY_LOOP_START_FRAMES = 3;
const MELODY_LOOP_TICK_INTERVAL_SECONDS = 5;
// A charged attack's heal is four times a strike's, as the wiki's Let the Show Begin♪ gives it
const CHARGED_ATTACK_HEAL_FACTOR = 4;
// Measured: gcsim v2.47.2 (MIT) barbara/burst.go, Shining Miracle's heal at 77 frames, once
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/burst.go
const SHINING_MIRACLE_HEAL_FRAMES = 77;
// Vitality Burst, from two constellations, cuts the skill's cooldown by 15% and gives a 15% Hydro DMG Bonus for the
// Melody Loop's duration, as the wiki's constellation page gives it, to each party member but Barbara, as the bonus of
// Gcsim v2.47.2 (MIT) barbara/cons.go does
// https://genshin-impact.fandom.com/wiki/Vitality_Burst
const VITALITY_BURST_CONSTELLATION = 2;
const VITALITY_BURST_COOLDOWN_MULTIPLIER = 0.85;
const VITALITY_BURST_HYDRO_DAMAGE_BONUS = 0.15;

// Whether the striker's Melody Loop stands on the team: a field it cast that ticks on the loop's interval, which its
// Burst's single heal does not
const checkIsMelodyLoopLive = (striker: Combatant, effects: readonly KitEffect[]): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "field" &&
      effect.characterId === striker.characterId &&
      effect.tickIntervalSeconds === MELODY_LOOP_TICK_INTERVAL_SECONDS &&
      effect.secondsRemaining > 0,
  );

// Barbara's strikes are Hydro catalyst hits of 1U, each heals the party while her Melody Loop stands, and their poise
// Is the wiki's Whisper of Water advanced properties. The wiki tags them "Barbara Hydro DMG", which no other hit of
// Hers shares, so they count under her Normal Attack internal cooldown
const createNormalAttack = (
  hitArea: AttackArea,
  poiseDamage: number,
  talentMultiplier: number,
  hitmarkFrames: number,
  frames: number,
  healParty: KitPartyHeal,
): KitAction => ({
  hits: [
    {
      element: Element.Hydro,
      gauge: 1,
      healParty,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage,
      talentMultiplier,
    },
  ],
  seconds: frames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// The Melody Loop's tick, written for Barbara as she cast it, with its heal in HP. Each heals the character on the
// Field by the regeneration, and the first gives every other member of the team Vitality Burst's Hydro DMG Bonus from
// Two constellations, for the loop's seconds
const createMelodyLoopTick =
  (owner: Combatant, regenerationHeal: number, loopSeconds: number) =>
  ({ activeCombatant, kitEffectState, party, tickIndex }: KitFieldTick): void => {
    healPartyMember(party, activeCombatant.characterId, regenerationHeal / activeCombatant.attributes.maxHealth);
    if (tickIndex > 0 || owner.constellationCount < VITALITY_BURST_CONSTELLATION) return;
    for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
      if (characterId !== owner.characterId)
        addKitEffect(kitEffectState, {
          amount: VITALITY_BURST_HYDRO_DAMAGE_BONUS,
          attribute: Attribute.HydroDamageBonus,
          characterId,
          kind: "buff",
          secondsRemaining: loopSeconds,
        });
  };

// Barbara's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Let the Show
// Begin♪'s droplets and Melody Loop, and Shining Miracle♪'s heal. Its multipliers are read from her proud skill groups
export const createBarbaraKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const regenerationHealthShare = getTalentMultiplier(
    talentMultiplierMap,
    BARBARA_SKILL_GROUP_ID,
    TALENT_START_LEVEL,
    0,
  );
  const regenerationFlatHeal = getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 1);
  const hitHealthShare = getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 2);
  const hitFlatHeal = getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 3);
  // The wiki's and the group's 15 seconds and gcsim's extra frame, so the fourth regeneration, 15 seconds after the
  // First, still falls within it
  const melodyLoopSeconds =
    getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 5) + 1 / 60;
  const burstHealthShare = getTalentMultiplier(talentMultiplierMap, BARBARA_BURST_GROUP_ID, TALENT_START_LEVEL, 0);
  const burstFlatHeal = getTalentMultiplier(talentMultiplierMap, BARBARA_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  // The Melody Loop's heal on a hit, a share of Barbara's Max HP plus flat HP, rolled certain while the loop stands and
  // Never otherwise, with no shield needed. It does not read Healing Bonus, as Bennett's and Jean's heals do not
  const createMelodyLoopHeal = (healFactor: number): KitPartyHeal => ({
    chance: (striker, effects) => (checkIsMelodyLoopLive(striker, effects) ? 1 : 0),
    defenseShare: 0,
    flatHealth: healFactor * hitFlatHeal,
    isUnshielded: true,
    maxHealthShare: healFactor * hitHealthShare,
  });
  const strikeHeal = createMelodyLoopHeal(1);
  // The droplets, each 1U of Hydro under an Elemental Skill internal cooldown with 40 poise, as the wiki's Let the Show
  // Begin♪ advanced properties give them
  const dropletHits = DROPLET_HITMARK_FRAMES.map((hitmarkFrames): KitHit => ({
    element: Element.Hydro,
    gauge: 1,
    hitArea: DROPLET_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 40,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  }));
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, BARBARA_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, BARBARA_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    // Measured: gcsim v2.47.2 (MIT) barbara/charge.go, the hit at 55 frames and the animation's 89, 14 of each skipped
    // After a strike's windup, so 41 and 75 here. The wiki's Whisper of Water gives it 1U of Hydro with no internal
    // Cooldown and 30 poise, and it heals four times a strike's heal while the Melody Loop stands
    chargedAttack: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 1,
          healParty: createMelodyLoopHeal(CHARGED_ATTACK_HEAL_FACTOR),
          hitArea: CHARGED_HIT_AREA,
          hitmarkSeconds: 41 / 60,
          poiseDamage: 30,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
        },
      ],
      seconds: 75 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
    // Measured: gcsim v2.47.2 (MIT) barbara/burst.go, the animation's 195 frames. Shining Miracle♪ deals no damage: its
    // Heal is a field cast where Barbara stands, ticking once, priced by her as she stood then
    elementalBurst: {
      hits: [],
      onStart: ({ body: { position }, combatant, kitEffectState }) => {
        const burstHeal = burstFlatHeal + burstHealthShare * combatant.attributes.maxHealth;
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: SHINING_MIRACLE_HEAL_FRAMES / 60,
          onTick: ({ activeCombatant, party }) =>
            healPartyMember(party, activeCombatant.characterId, burstHeal / activeCombatant.attributes.maxHealth),
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its heal, so the step that runs the heal still has it
          secondsRemaining: SHINING_MIRACLE_HEAL_FRAMES / 60 + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: 195 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) barbara/skill.go, the animation's 55 frames. The droplets are a summon and the
    // Melody Loop a field, both cast where Barbara stands and priced by her as she stood then
    elementalSkill: {
      hits: [],
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, createKitSummon({ facing, height, position }, combatant, dropletHits));
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: MELODY_LOOP_START_FRAMES / 60,
          onTick: createMelodyLoopTick(
            combatant,
            regenerationFlatHeal + regenerationHealthShare * combatant.attributes.maxHealth,
            melodyLoopSeconds,
          ),
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: MELODY_LOOP_START_FRAMES / 60 + melodyLoopSeconds,
          tickIndex: 0,
          tickIntervalSeconds: MELODY_LOOP_TICK_INTERVAL_SECONDS,
        });
      },
      seconds: 55 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getSkillCooldownMultiplier: ({ combatant }) =>
      combatant.constellationCount >= VITALITY_BURST_CONSTELLATION ? VITALITY_BURST_COOLDOWN_MULTIPLIER : 1,
    // Measured: gcsim v2.47.2 (MIT) barbara/plunge.go, the low plunge at 44 frames and the high at 45, ending at 66 and
    // 68. The wiki's Whisper of Water gives each 1U of Hydro with no internal cooldown, and 50 and 100 poise
    highPlunge: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 1,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 45 / 60,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: 68 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 1,
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 44 / 60,
          poiseDamage: 50,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
        },
      ],
      seconds: 66 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) barbara/attack.go, each strike's hitmark and the animation that ends it at 60 fps
    normalAttacks: [
      createNormalAttack(
        STRIKE_HIT_AREA,
        7.35,
        getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
        6,
        23,
        strikeHeal,
      ),
      createNormalAttack(
        STRIKE_HIT_AREA,
        7.5,
        getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
        11,
        28,
        strikeHeal,
      ),
      createNormalAttack(
        STRIKE_HIT_AREA,
        7.5,
        getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
        12,
        30,
        strikeHeal,
      ),
      createNormalAttack(
        FOURTH_STRIKE_HIT_AREA,
        9.45,
        getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
        32,
        60,
        strikeHeal,
      ),
    ],
    // The collision's poise is the wiki's 5, and it deals Hydro with no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      element: Element.Hydro,
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 5,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BARBARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    },
    // The group's, the wiki's and gcsim's 32 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, BARBARA_SKILL_GROUP_ID, TALENT_START_LEVEL, 6),
  };
};
