import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Lyney's proud skill groups, read at his talent level. The attack group holds the four strikes at 0, 1, 2 and 3 with the
// Third strike's second hit at 3, and the fourth at 4, the plunges' collision, low and high at 5, 6 and 7, the aimed shot at
// 8, the fully charged Pyro shot at 9, the Prop Arrow at 10 and the Pyrotechnic Strike at 14. The skill group holds
// Bewildering Lights' hit at 0 and its cooldown at 4. The burst group holds Miracle Parade's tick at 0, its Explosive Firework
// At 1, its cooldown at 3 and its energy cost at 4
const LYNEY_ATTACK_GROUP_ID = 8431;
const LYNEY_SKILL_GROUP_ID = 8432;
const LYNEY_BURST_GROUP_ID = 8439;

// Measured: gcsim (MIT) lyney/attack.go, each strike's release, the 10 frames its arrow travels to the primary target, and its
// Cancel frame. Each arrow lands on the primary target, priced as a circle of a metre round the body, as Ganyu's are
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lyney
const ARROW_TRAVEL_FRAMES = 10;
const ARROW_HIT_AREA = createCircleReach(0, 1);
const NORMAL_ATTACKS = [
  { cancelFrames: 32, hits: [{ hitmarkFrames: 17, multiplierIndex: 0 }] },
  { cancelFrames: 34, hits: [{ hitmarkFrames: 12, multiplierIndex: 1 }] },
  {
    cancelFrames: 86,
    hits: [
      { hitmarkFrames: 20, multiplierIndex: 2 },
      { hitmarkFrames: 29, multiplierIndex: 3 },
    ],
  },
  { cancelFrames: 66, hits: [{ hitmarkFrames: 29, multiplierIndex: 4 }] },
];

// Measured: gcsim (MIT) lyney/aimed.go, the Prop Arrow released at 103 frames, its animation at 111 frames, and its Grin-Malkin
// Hat set where it lands at 113 frames, which lasts 238 frames and then its Pyrotechnic Strike travels 36 frames to the primary
// Target, the default gcsim gives it. The Pyro Strike hits as the hat expires, so it lands 387 frames from the cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lyney
const PROP_ARROW_FRAMES = 111;
const PROP_ARROW_HITMARK_FRAMES = 103 + ARROW_TRAVEL_FRAMES;
const GRIN_MALKIN_HAT_AIMED_FRAMES = 238;
const PYROTECHNIC_TRAVEL_FRAMES = 36;
const PYROTECHNIC_POISE_DAMAGE = 90;
const PYROTECHNIC_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 1);
const PYROTECHNIC_STRIKE_AIMED_HITMARK_FRAMES =
  PROP_ARROW_HITMARK_FRAMES + GRIN_MALKIN_HAT_AIMED_FRAMES + PYROTECHNIC_TRAVEL_FRAMES;

// Measured: gcsim (MIT) lyney/skill.go, Bewildering Lights' circle set 5.5 metres ahead of the body with its hit at 18 frames and
// Its animation at 43 frames. Its Prop Surplus bonus, its heal and the hats it explodes are not built yet
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lyney
const SKILL_FRAMES = 43;
const SKILL_HITMARK_FRAMES = 18;
const SKILL_HIT_AREA = createCircleReach(5.5, 5.5);

// Measured: gcsim (MIT) lyney/burst.go, Wondrous Trick: Miracle Parade's animation at 321 frames. Its Explosive Firework is a
// Circle of radius 6 round the body, set off 182 frames after its start at 100 frames, which is 282, and it lands 6 frames
// Later, at 288. Its Grin-Malkin Hat is set at 282 and lasts 245 frames, then its Pyrotechnic Strike travels 36 frames.
// Its ticks are not built yet: they strike each enemy within four metres once while the burst's mark is not on it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lyney
const BURST_FRAMES = 321;
const BURST_START_FRAMES = 100;
const BURST_DURATION_FRAMES = 182;
const EXPLOSIVE_FIREWORK_SNAPSHOT_FRAMES = BURST_START_FRAMES + BURST_DURATION_FRAMES;
const EXPLOSIVE_FIREWORK_HITMARK_FRAMES = EXPLOSIVE_FIREWORK_SNAPSHOT_FRAMES + 6;
const EXPLOSIVE_FIREWORK_HIT_AREA = createCircleReach(0, 6);
const GRIN_MALKIN_HAT_BURST_FRAMES = 245;
const PYROTECHNIC_STRIKE_BURST_HITMARK_FRAMES =
  EXPLOSIVE_FIREWORK_SNAPSHOT_FRAMES + GRIN_MALKIN_HAT_BURST_FRAMES + PYROTECHNIC_TRAVEL_FRAMES;

// Provisional: gcsim's Lyney folder has no plunge file, so his plunges take the timings and collision of the shared plunge
// Values Bennett's kit reads from gcsim (bennett/plunge.go), with his table's indexes 5 to 7 for collision, low and high. The
// Manual verification list asks whether they match the game
const PLUNGE_COLLISION_HITMARK_SECONDS = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 25;
const LOW_PLUNGE_SECONDS = 67 / 60;
const LOW_PLUNGE_HITMARK_SECONDS = 36 / 60;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_SECONDS = 68 / 60;
const HIGH_PLUNGE_HITMARK_SECONDS = 38 / 60;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

export const LYNEY_CHARACTER_ID = 10_000_084;

export const createLyneyKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNEY_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNEY_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNEY_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The hat's Pyrotechnic Strike, summoned where the shot or burst is cast and landing on its own clock from there
  const createPyrotechnicStrike = (hitmarkFrames: number): KitHit => ({
    element: Element.Pyro,
    gauge: 1,
    hitArea: PYROTECHNIC_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: PYROTECHNIC_POISE_DAMAGE,
    talentMultiplier: attackMultiplier(14),
  });
  const createHatSummon = (body: KitBody, combatant: Combatant, hitmarkFrames: number) =>
    createKitSummon(body, combatant, [createPyrotechnicStrike(hitmarkFrames)]);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitmarkFrames, multiplierIndex }) => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(multiplierIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // The Prop Arrow is his charged attack, the shot a full hold takes with its Grin-Malkin Hat. The tap-released Physical
  // Aimed Shot and the Pyro shot at a partial hold are not built yet, since a kit holds one charged attack
  const chargedAttack: KitAction = {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: PROP_ARROW_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(10),
      },
    ],
    isAimed: true,
    onStart: ({ body, combatant, kitEffectState }) => {
      addKitEffect(kitEffectState, createHatSummon(body, combatant, PYROTECHNIC_STRIKE_AIMED_HITMARK_FRAMES));
    },
    seconds: PROP_ARROW_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalBurst: KitAction = {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: EXPLOSIVE_FIREWORK_HIT_AREA,
        hitmarkSeconds: EXPLOSIVE_FIREWORK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(1),
      },
    ],
    onStart: ({ body, combatant, kitEffectState }) => {
      addKitEffect(kitEffectState, createHatSummon(body, combatant, PYROTECHNIC_STRIKE_BURST_HITMARK_FRAMES));
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack,
    chargedAttackStamina: 0,
    elementalBurst,
    elementalSkill,
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_SECONDS,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(7),
        },
      ],
      seconds: HIGH_PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_SECONDS,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: LOW_PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_SECONDS,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(5),
    },
    skillCooldownSeconds: skillMultiplier(4),
  };
};
