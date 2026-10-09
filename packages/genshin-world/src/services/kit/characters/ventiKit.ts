import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Venti's proud skill groups, read at his talent level. The attack group holds the six shots at 0 to 5, the first and
// Fourth each loosing two arrows at their one value, the aimed shot at 6 and the fully charged aimed shot at 7, and the
// Plunges' collision, low and high at 8, 9 and 10. The skill group holds the press at 0 and its cooldown at 1, and the
// Hold at 2 and its cooldown at 3. The burst group holds the Stormeye's ticks at 0, its absorbed element's at 1, its
// Seconds at 2, and the burst's cooldown and energy cost at 3 and 4
const VENTI_ATTACK_GROUP_ID = 2231;
const VENTI_SKILL_GROUP_ID = 2232;
const VENTI_BURST_GROUP_ID = 2239;

// Measured: gcsim v2.47.2 (MIT) venti/attack.go and aimed.go, the arrows and the shots land at the primary target through
// A box a metre long and a tenth wide, so they are priced as a circle of a metre round the body, as Amber's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/aimed.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Provisional: gcsim models only the high plunge that follows a held Skyward Sonnet, so the collision's and the low
// Plunge's reach are Amber's until one measures them
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
// Measured: gcsim v2.47.2 (MIT) venti/plunge.go, the high plunge's circle of radius 3.5 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/plunge.go
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) venti/skill.go, the press's circle of radius 3 on the primary target, priced round the body
// As Mona's strikes are, and the hold's circle of radius 6 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/skill.go
const PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HOLD_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
// Measured: gcsim v2.47.2 (MIT) venti/burst.go, the Stormeye placed 5 metres ahead of the body, its ticks a circle of
// Radius 4 round it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/burst.go
const STORMEYE_OFFSET = 5;
const STORMEYE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
// Provisional: the reach the targeting reads for the shots, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) venti/attack.go, each shot's arrows' hitmarks and the animation that ends it at 60 fps,
// The first and fourth loosing two arrows. gcsim's default 10 frames of an arrow's flight are not added, as Amber's are
// Not. Each arrow's poise is the wiki's Divine Marksmanship advanced properties
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/attack.go
const VENTI_SHOTS = [
  { frames: 30, hitmarkFrames: [17, 27], poiseDamage: 6 },
  { frames: 38, hitmarkFrames: [19], poiseDamage: 13.8 },
  { frames: 33, hitmarkFrames: [28], poiseDamage: 15.6 },
  { frames: 31, hitmarkFrames: [15, 28], poiseDamage: 7.68 },
  { frames: 22, hitmarkFrames: [17], poiseDamage: 15 },
  { frames: 98, hitmarkFrames: [49], poiseDamage: 20.4 },
];

// Measured: gcsim v2.47.2 (MIT) venti/aimed.go, the fully charged shot at 86 frames and its animation's 94
const FULL_AIM_HITMARK_FRAMES = 86;
const FULL_AIM_FRAMES = 94;
// Splitting Gales, from one constellation, looses two more arrows with each aimed shot, each dealing 33% of its DMG as 1U
// Of Anemo under the Charged Attack internal cooldown with 2 poise, as the wiki's constellation page gives it. gcsim
// V2.47.2 (MIT) venti/cons.go lands them with the shot
// https://genshin-impact.fandom.com/wiki/Splitting_Gales
const SPLITTING_GALES_CONSTELLATION = 1;
const SPLITTING_GALES_ARROW_COUNT = 2;
const SPLITTING_GALES_SHARE = 0.33;
const SPLITTING_GALES_POISE_DAMAGE = 2;
// Measured: gcsim v2.47.2 (MIT) venti/skill.go, the press's Wind Domain at 51 frames, which gcsim queues apart from the
// Press's animation, so the press ends at its earliest cancel, 22 frames, and the domain lands from a summon. The hold's
// Lands at 74 frames, and the hold ends at its earliest cancel, its high plunge at 116, as its rise is not built
const PRESS_HITMARK_FRAMES = 51;
const PRESS_FRAMES = 22;
const HOLD_HITMARK_FRAMES = 74;
const HOLD_FRAMES = 116;
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is Bennett's first
// Charge Level's, as Razor's is, until a recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// Breeze of Reminiscence, from two constellations, takes 12% off the Anemo RES of each enemy Skyward Sonnet strikes for 10
// Seconds, as the wiki's constellation page and gcsim v2.47.2 (MIT) venti/cons.go give it
// https://genshin-impact.fandom.com/wiki/Breeze_of_Reminiscence
const BREEZE_OF_REMINISCENCE_CONSTELLATION = 2;
const BREEZE_OF_REMINISCENCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "venti-breeze-of-reminiscence",
  resistanceReduction: { [Element.Anemo]: 0.12 },
  secondsRemaining: 10,
};
// Measured: gcsim v2.47.2 (MIT) venti/burst.go, the Stormeye standing from 94 frames, its 20 ticks every 24 frames from
// 106, and the animation's 95. The wiki's Wind's Grand Ode gives the 20 ticks within its 8 seconds
const STORMEYE_START_FRAMES = 94;
const STORMEYE_FIRST_TICK_FRAMES = 106;
const STORMEYE_TICK_INTERVAL_FRAMES = 24;
const STORMEYE_TICK_COUNT = 20;
const BURST_FRAMES = 95;
// Stormeye, from Ascension 4, regenerates 15 energy for Venti once the Stormeye's seconds end, as the wiki's passive page
// And gcsim v2.47.2 (MIT) venti/asc.go give it, which gcsim's burst.go queues 480 frames past the Stormeye's start
// https://genshin-impact.fandom.com/wiki/Stormeye
const STORMEYE_PASSIVE_ASCENSION = 4;
const STORMEYE_PASSIVE_ENERGY = 15;
// Storm of Defiance, from six constellations, takes 20% off the Anemo RES of each enemy the Stormeye strikes, for gcsim
// V2.47.2 (MIT) venti/cons.go's 600 frames
// https://genshin-impact.fandom.com/wiki/Storm_of_Defiance
const STORM_OF_DEFIANCE_CONSTELLATION = 6;
const STORM_OF_DEFIANCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "venti-storm-of-defiance",
  resistanceReduction: { [Element.Anemo]: 0.2 },
  secondsRemaining: 10,
};

// Venti's first kit, at talent level 1: six shots, a fully charged aimed shot, a collision and two plunges, Skyward
// Sonnet's press and hold, and Wind's Grand Ode's Stormeye. Its multipliers are read from his proud skill groups
export const createVentiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  // A bow's arrows are physical, so none applies a gauge and none has an internal cooldown
  const normalAttacks = VENTI_SHOTS.map(({ frames, hitmarkFrames, poiseDamage }, index): KitAction => {
    const talentMultiplier = getTalentMultiplier(talentMultiplierMap, VENTI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
    return {
      hits: hitmarkFrames.map((hitmark) => ({
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: hitmark / 60,
        poiseDamage,
        talentMultiplier,
      })),
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  });
  // The wiki's fully charged aimed shot deals 1U of Anemo with Dropoff and 20 poise, under a Charged Attack internal
  // Cooldown
  const fullAimHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FULL_AIM_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ChargedAttack,
    poiseDamage: 20,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
  };
  const splittingGalesHits = Array.from({ length: SPLITTING_GALES_ARROW_COUNT }, (): KitHit => ({
    ...fullAimHit,
    poiseDamage: SPLITTING_GALES_POISE_DAMAGE,
    talentMultiplier: SPLITTING_GALES_SHARE * fullAimHit.talentMultiplier,
  }));
  // The wiki's Skyward Sonnet gives the press and the hold 2U of Anemo with no internal cooldown and 150 poise, and from
  // Two constellations each takes Breeze of Reminiscence's Anemo RES
  const createWindDomainHit = (groupIndex: number, hitArea: AttackArea, hitmarkFrames: number): KitHit => ({
    element: Element.Anemo,
    enemyStatus: (combatant) =>
      combatant.constellationCount >= BREEZE_OF_REMINISCENCE_CONSTELLATION ? BREEZE_OF_REMINISCENCE_STATUS : undefined,
    gauge: 2,
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 150,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex),
  });
  const pressHit = createWindDomainHit(0, PRESS_HIT_AREA, PRESS_HITMARK_FRAMES);
  const stormeyeSeconds = getTalentMultiplier(talentMultiplierMap, VENTI_BURST_GROUP_ID, TALENT_START_LEVEL, 2);
  // The wiki's Wind's Grand Ode gives each tick 1U of Anemo under the Elemental Burst internal cooldown and 4 poise, and
  // From six constellations each takes Storm of Defiance's Anemo RES
  const stormeyeHits = Array.from({ length: STORMEYE_TICK_COUNT }, (_value, index): KitHit => ({
    element: Element.Anemo,
    enemyStatus: (combatant) =>
      combatant.constellationCount >= STORM_OF_DEFIANCE_CONSTELLATION ? STORM_OF_DEFIANCE_STATUS : undefined,
    gauge: 1,
    hitArea: STORMEYE_HIT_AREA,
    hitmarkSeconds: (STORMEYE_FIRST_TICK_FRAMES + STORMEYE_TICK_INTERVAL_FRAMES * index) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 4,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  }));
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, VENTI_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, VENTI_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    // From one constellation, the shot's start casts Splitting Gales' arrows, landing with it from where Venti stands
    chargedAttack: {
      hits: [fullAimHit],
      isAimed: true,
      onStart: ({ body, combatant, kitEffectState }) => {
        if (combatant.constellationCount < SPLITTING_GALES_CONSTELLATION) return;
        addKitEffect(kitEffectState, createKitSummon(body, combatant, splittingGalesHits));
      },
      seconds: FULL_AIM_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // A bow's aimed shot costs no stamina, as the wiki's Divine Marksmanship gives it
    chargedAttackStamina: 0,
    // The Stormeye is a summon cast 5 metres ahead of where Venti faces, landing its ticks from there. From Ascension 4, a
    // Field with no edge ticks once as the Stormeye's seconds end, giving Venti his energy up to what his burst costs
    elementalBurst: {
      hits: [],
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
        const stormeyePosition = {
          x: position.x - Math.sin(facing) * STORMEYE_OFFSET,
          z: position.z - Math.cos(facing) * STORMEYE_OFFSET,
        };
        addKitEffect(
          kitEffectState,
          createKitSummon({ facing, height, position: stormeyePosition }, combatant, stormeyeHits),
        );
        if (combatant.ascension < STORMEYE_PASSIVE_ASCENSION) return;
        const passiveSeconds = STORMEYE_START_FRAMES / 60 + stormeyeSeconds;
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: passiveSeconds,
          onTick: ({ party }) => {
            const partyMember = getPartyMember(party, combatant.characterId);
            partyMember.energy = Math.min(combatant.kit.burstEnergyCost, partyMember.energy + STORMEYE_PASSIVE_ENERGY);
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: passiveSeconds + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [pressHit])),
      seconds: PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: {
          hits: [createWindDomainHit(2, HOLD_HIT_AREA, HOLD_HITMARK_FRAMES)],
          seconds: HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        // The group's, the wiki's and gcsim's 15 seconds for the hold
        cooldownSeconds: getTalentMultiplier(talentMultiplierMap, VENTI_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    // Provisional: gcsim counts its high plunge's 58 frames from its start in the air after a held Skyward Sonnet, and this
    // Kit starts a plunge's action as it lands, so each plunge hits as its action starts and ends at 0.4 seconds, as
    // Amber's do. The wiki's Divine Marksmanship gives them 50 and 100 poise
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 50,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 10, and it applies no gauge, as the wiki's table gives
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 10,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, VENTI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    // The group's, the wiki's and gcsim's 6 seconds for the press
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, VENTI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
