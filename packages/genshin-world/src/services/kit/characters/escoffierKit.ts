import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Escoffier's proud skill groups, read at her talent level. The attack group holds the normal attack's hits at 0 to 3,
// The charged attack at 4, its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds
// The press at 0, Frosty Parfait's tick at 1, the Surging Blade at 3, its interval at 4 and the cooldown at 5, and the burst
// Group holds Scoring Cuts at 0, its heal's share of ATK at 1 and flat heal at 2, its cooldown at 3 and energy cost at 4
const ESCOFFIER_ATTACK_GROUP_ID = 11231;
const ESCOFFIER_SKILL_GROUP_ID = 11232;
const ESCOFFIER_BURST_GROUP_ID = 11239;
const CHARGED_ATTACK_STAMINA_INDEX = 5;
const SKILL_COOLDOWN_INDEX = 5;
const SKILL_SURGING_BLADE_INDEX = 3;
const SKILL_ALIGNED_INTERVAL_INDEX = 4;
const BURST_HEAL_PER_ATTACK_INDEX = 1;
const BURST_HEAL_FLAT_INDEX = 2;
const BURST_COOLDOWN_INDEX = 3;
const BURST_ENERGY_COST_INDEX = 4;

// Measured: gcsim (MIT, main) escoffier/attack.go, the three normal attacks' hitmarks, cancels and reaches. The first is a box,
// The second a circle, and the third two circles, one per hit, each centred on the offset gcsim gives it. gcsim gives no
// Poise to a normal attack, so each reads 0
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/attack.go
const NORMAL_ATTACK_FRAMES: readonly {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; multiplierIndex: number }[];
}[] = [
  { cancelFrames: 22, hits: [{ hitArea: createBoxReach(0, 1.6, 3), hitmarkFrames: 7, multiplierIndex: 0 }] },
  { cancelFrames: 30, hits: [{ hitArea: createCircleReach(0.7, 2), hitmarkFrames: 16, multiplierIndex: 1 }] },
  {
    cancelFrames: 62,
    hits: [
      { hitArea: createCircleReach(0.8, 2.5), hitmarkFrames: 27, multiplierIndex: 2 },
      { hitArea: createCircleReach(0.4, 2.5), hitmarkFrames: 40, multiplierIndex: 3 },
    ],
  },
];

// Measured: gcsim (MIT, main) escoffier/charge.go, the Charged Attack's animation at 65 frames and its hit at 20 as a box of
// 3.3 by 3.5 metres centred 1.2 metres behind the primary target, which the target is priced as. gcsim gives it no poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/charge.go
const CHARGED_ATTACK_FRAMES = 65;
const CHARGED_ATTACK_HITMARK_FRAMES = 20;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, createBoxReach(-1.2, 3.3, 3.5).radius);

// Measured: gcsim (MIT, main) escoffier/plunge.go, the low plunge's animation at 76 frames and its hit at 41 as a circle of
// Radius 3 ahead with 100 poise, the high plunge's at 77 frames and 43 as a circle of radius 5 ahead with 150 poise, and the
// Collision at 35 frames as a circle of radius 1 round the body. The plunges are the airborne ones gcsim plays
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/plunge.go
const LOW_PLUNGE_FRAMES = 76;
const LOW_PLUNGE_HITMARK_FRAMES = 41;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 77;
const HIGH_PLUNGE_HITMARK_FRAMES = 43;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const PLUNGE_COLLISION_HITMARK_FRAMES = 35;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1);

// Measured: gcsim (MIT, main) escoffier/skill.go, Low-Temperature Cooking's animation at 35 frames and its press at 23 as a
// Circle of radius 5 round the body. Its cooldown starts 22 frames after the press in gcsim, which the framework does not hold
// Frosty Parfait ticks 21 times, from 148 frames and every 58.5 frames, each landing 5 frames after its tick as a circle of
// Radius 1.5 on the primary target, which the target is priced as. The Surging Blade lands at 83 frames, a circle of radius 5
// Round the body, when the Aligned interval of 10 seconds is not running. gcsim gives Arkhe's application a TODO, so it is
// Not applied here. The interval is checked on the cast, not at 83 frames as gcsim queues it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/skill.go
const SKILL_FRAMES = 35;
const SKILL_HITMARK_FRAMES = 23;
const SKILL_HIT_AREA = createCircleReach(0, 5);
const SKILL_TICK_COUNT = 21;
const SKILL_FIRST_TICK_FRAMES = 148;
const SKILL_TICK_INTERVAL_FRAMES = 58.5;
const SKILL_TRAVEL_FRAMES = 5;
const SKILL_TICK_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1.5);
const SURGING_BLADE_HITMARK_FRAMES = 83;
const SURGING_BLADE_HIT_AREA = createCircleReach(0, 5);
const ALIGNED_INTERVAL_STATUS_ID = "escoffier-aligned-icd";

// Measured: gcsim (MIT, main) escoffier/burst.go, Scoring Cuts' animation at 110 frames and its hit at 92 as a circle of
// Radius 7 one metre ahead, with the heal 97 frames in, its flat amount and its share of ATK read from the table. gcsim gives it
// No poise. The heal lands on the active character as a single tick of a field the burst sets going
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/burst.go
const BURST_FRAMES = 110;
const BURST_HITMARK_FRAMES = 92;
const BURST_HIT_AREA = createCircleReach(1, 7);
const BURST_HEAL_FRAMES = 97;
const BURST_HEAL_FIELD_ID = "escoffier-scoring-cuts-heal";

// Measured: gcsim (MIT, main) escoffier/asc.go, Rehab Diet heals the active character nine times, from 157 frames and every
// 58.5 frames, for 1.3824 of her ATK each tick, and the burst starts it on Ascension 1 or above
const REHAB_DIET_SCALING = 1.3824;
const REHAB_DIET_COUNT = 9;
const REHAB_DIET_FIRST_TICK_FRAMES = 157;
const REHAB_DIET_INTERVAL_FRAMES = 58.5;
const REHAB_DIET_FIELD_ID = "escoffier-rehab-diet";
const REHAB_DIET_ASCENSION = 1;

// The frame each Frosty Parfait tick's hit lands on: its tick's frame, with the travel the tick reaches the target in
const skillTickFrames = (index: number): number =>
  SKILL_FIRST_TICK_FRAMES + Math.ceil(SKILL_TICK_INTERVAL_FRAMES * index) + SKILL_TRAVEL_FRAMES;

export const ESCOFFIER_CHARACTER_ID = 10_000_112;

// Escoffier's kit outside the passives and constellations that wait: her three normal attacks, charged attack, low, high and
// Collision plunges, Low-Temperature Cooking with its Frosty Parfait ticks and Surging Blade, Scoring Cuts with its heal, and
// Rehab Diet from Ascension 1. Her Cryo RES shred from Ascension 4, and her Constellations, wait on the hooks the page names
export const createEscoffierKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  // Scoring Cuts' heal is one tick of a field, which the burst sets going and which heals the active character from the
  // Caster's ATK, a flat amount and a share of it
  const createScoringCutsHealField = (body: KitBody, combatant: Combatant): KitField =>
    createKitField(combatant.characterId, body.position, {
      id: BURST_HEAL_FIELD_ID,
      nextTickSeconds: BURST_HEAL_FRAMES / 60,
      onTick: (tick) =>
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          burstMultiplier(BURST_HEAL_FLAT_INDEX) +
            burstMultiplier(BURST_HEAL_PER_ATTACK_INDEX) * combatant.attributes.attack,
        ),
      radius: BURST_HIT_AREA.radius,
      secondsRemaining: BURST_HEAL_FRAMES / 60 + 0.5,
      // A second past the one tick, so no second tick falls within the field
      tickIntervalSeconds: 1,
    });
  // Rehab Diet heals the active character nine times from the caster's ATK, which the burst starts on Ascension 1
  const createRehabDietField = (body: KitBody, combatant: Combatant): KitField => {
    const lastTickSeconds = (REHAB_DIET_FIRST_TICK_FRAMES + REHAB_DIET_INTERVAL_FRAMES * (REHAB_DIET_COUNT - 1)) / 60;
    return createKitField(combatant.characterId, body.position, {
      id: REHAB_DIET_FIELD_ID,
      nextTickSeconds: REHAB_DIET_FIRST_TICK_FRAMES / 60,
      onTick: (tick) =>
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          REHAB_DIET_SCALING * combatant.attributes.attack,
        ),
      radius: BURST_HIT_AREA.radius,
      secondsRemaining: lastTickSeconds + 0.5,
      tickIntervalSeconds: REHAB_DIET_INTERVAL_FRAMES / 60,
    });
  };
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ESCOFFIER_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ESCOFFIER_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ESCOFFIER_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTickHits: KitHit[] = Array.from({ length: SKILL_TICK_COUNT }, (_value, index): KitHit => ({
    hitArea: SKILL_TICK_HIT_AREA,
    hitmarkSeconds: skillTickFrames(index) / 60,
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(1),
  }));
  const createNormalAttack = ({ cancelFrames, hits }: (typeof NORMAL_ATTACK_FRAMES)[number]): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, multiplierIndex }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(multiplierIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const createPlunge = (
    frames: number,
    hitmarkFrames: number,
    hitArea: AttackArea,
    poiseDamage: number,
    multiplierIndex: number,
  ): KitAction => ({
    hits: [
      { hitArea, hitmarkSeconds: hitmarkFrames / 60, poiseDamage, talentMultiplier: attackMultiplier(multiplierIndex) },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: burstMultiplier(BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstMultiplier(BURST_ENERGY_COST_INDEX),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(4),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(CHARGED_ATTACK_STAMINA_INDEX),
    elementalBurst: {
      hits: [
        {
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        addKitEffect(kitEffectState, createScoringCutsHealField(body, combatant));
        if (combatant.ascension >= REHAB_DIET_ASCENSION)
          addKitEffect(kitEffectState, createRehabDietField(body, combatant));
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, skillTickHits);
        if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, ALIGNED_INTERVAL_STATUS_ID)) return;
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          id: ALIGNED_INTERVAL_STATUS_ID,
          kind: "status",
          secondsRemaining: skillMultiplier(SKILL_ALIGNED_INTERVAL_INDEX),
        });
        castKitSummon(kitEffectState, body, combatant, [
          {
            hitArea: SURGING_BLADE_HIT_AREA,
            hitmarkSeconds: SURGING_BLADE_HITMARK_FRAMES / 60,
            poiseDamage: 0,
            talentMultiplier: skillMultiplier(SKILL_SURGING_BLADE_INDEX),
          },
        ]);
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_POISE_DAMAGE,
      8,
    ),
    lowPlunge: createPlunge(
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_POISE_DAMAGE,
      7,
    ),
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames) => createNormalAttack(frames)),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(SKILL_COOLDOWN_INDEX),
  };
};
