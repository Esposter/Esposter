import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Lynette's proud skill groups, read at her talent level. The attack group holds the strikes at 0, 1, 4 and the third strike's
// Two hits at 2 and 3, the charged attack's two hits at 5 and 6 and its stamina at 7, and the plunges' collision, low and high
// At 8, 9 and 10. The skill group holds Enigmatic Feint's thrust at 0, its aligned attack at 2, and its cooldown at 6. The burst
// Group holds Magic Trick: Astonishing Shift's hit at 0, the Bogglecat Box's tick at 1, its duration at 3, its cooldown at 4
// And its energy cost at 5
const LYNETTE_ATTACK_GROUP_ID = 8331;
const LYNETTE_SKILL_GROUP_ID = 8332;
const LYNETTE_BURST_GROUP_ID = 8339;

// Measured: gcsim (MIT) lynette/attack.go, each strike's hitmarks, the frame its action cancels at by default and its reach:
// The first a circle, the rest boxes, each reached from the body by its offset and its box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
// Each hit names its hitmark and the index of its talent multiplier in the table
const NORMAL_ATTACKS = [
  { cancelFrames: 30, hitArea: createCircleReach(0.3, 2), hits: [{ hitmarkFrames: 17, multiplierIndex: 0 }] },
  { cancelFrames: 27, hitArea: createBoxReach(-0.3, 1.8, 2.8), hits: [{ hitmarkFrames: 13, multiplierIndex: 1 }] },
  {
    cancelFrames: 47,
    hitArea: createBoxReach(0, 1.5, 2.5),
    hits: [
      { hitmarkFrames: 23, multiplierIndex: 2 },
      { hitmarkFrames: 31, multiplierIndex: 3 },
    ],
  },
  { cancelFrames: 68, hitArea: createBoxReach(0, 2.2, 2.5), hits: [{ hitmarkFrames: 29, multiplierIndex: 4 }] },
];

// Measured: gcsim (MIT) lynette/charge.go, the charged attack's two slashes at 12 and 13 frames, each a circle of radius 2.2
// Set 0.8 metres ahead of the body, and its animation at 51 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const CHARGED_ATTACK_FRAMES = 51;
const CHARGED_ATTACK_HITMARK_FRAMES = [12, 13];
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.8, 2.2);

// Measured: gcsim (MIT) lynette/plunge.go, the low plunge's circle of radius 3 set a metre ahead of the body at 45 frames with its
// Animation at 73, the high plunge's circle of radius 5 at 47 frames with its animation at 75, and the collision's circle of
// Radius 1 at 39 frames, which deals no gauge. The low and high plunges deal 100 and 150 poise
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const LOW_PLUNGE_FRAMES = 73;
const LOW_PLUNGE_HITMARK_FRAMES = 45;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const HIGH_PLUNGE_FRAMES = 75;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const PLUNGE_COLLISION_HITMARK_FRAMES = 39;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);

// Measured: gcsim (MIT) lynette/skill.go, Enigmatic Feint's press as a box of 1.8 metres wide and 4.5 long, set half a metre
// Ahead of the body, at its hitmark of 28 frames, with its animation at 58 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const SKILL_FRAMES = 58;
const SKILL_HITMARK_FRAMES = 28;
const SKILL_HIT_AREA = createBoxReach(-0.5, 1.8, 4.5);

// Measured: gcsim (MIT) lynette/burst.go, Magic Trick: Astonishing Shift's animation at 56 frames, its initial hit as a circle of
// Radius 4.5 set 1.5 metres ahead of the body at 18 frames, and the Bogglecat Box beside it, set 1.8 metres ahead of the body
// And spawned at 14 frames. Its ticks fall every 59 frames from 122, while it lasts 754 frames, as gcsim queues them, and each
// Strikes a circle of radius 6 round the box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const BURST_FRAMES = 56;
const BURST_HITMARK_FRAMES = 18;
const BURST_HIT_AREA = createCircleReach(1.5, 4.5);
const BOGGLECAT_BOX_OFFSET_METRES = 1.8;
const BOGGLECAT_BOX_DURATION_FRAMES = 754;
const BOGGLECAT_FIRST_TICK_FRAMES = 122;
const BOGGLECAT_TICK_INTERVAL_FRAMES = 59;
const BOGGLECAT_TICK_HIT_AREA = createCircleReach(0, 6);

// Not built yet: Hold E, its Shadowsign and release strike, which hold for as long as the press is held, and its aligned attack,
// Whose Surging Blade lands only off a ten-second cooldown, both of which need a hold whose hit lands at its held time and a
// Conditional hit. The Bogglecat Box's vivid shots, which absorb the Cryo, Pyro, Hydro and Electro of an enemy hit and set it
// Off, and its absorb check, and her heal and HP drain on Enigmatic Feint, which read her own HP. Her Ascension and
// Constellation passives are not built either.
export const LYNETTE_CHARACTER_ID = 10_000_083;

const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createLynetteKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNETTE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNETTE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LYNETTE_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hitArea, hits }): KitAction => ({
    hits: hits.map(({ hitmarkFrames, multiplierIndex }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(multiplierIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: CHARGED_ATTACK_HITMARK_FRAMES.map((frames, hitIndex) => ({
      hitArea: CHARGED_ATTACK_HIT_AREA,
      hitmarkSeconds: frames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(5 + hitIndex),
    })),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Anemo,
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

  // Each tick strikes from the box's place, which holds as the burst starts, wherever the body stands
  const createBogglecatTick =
    (combatant: Combatant, centre: KitBody): KitField["onTick"] =>
    ({ kitEffectState }) =>
      castKitSummon(kitEffectState, centre, combatant, [
        {
          element: Element.Anemo,
          gauge: 1,
          hitArea: BOGGLECAT_TICK_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(1),
        },
      ]);

  const createBogglecatField = (body: KitBody, combatant: Combatant): KitField => {
    const box = createAheadBody(body, BOGGLECAT_BOX_OFFSET_METRES);
    return createKitField(combatant.characterId, box.position, {
      nextTickSeconds: BOGGLECAT_FIRST_TICK_FRAMES / 60,
      onTick: createBogglecatTick(combatant, box),
      secondsRemaining: BOGGLECAT_BOX_DURATION_FRAMES / 60,
      tickIntervalSeconds: BOGGLECAT_TICK_INTERVAL_FRAMES / 60,
    });
  };

  const elementalBurst: KitAction = {
    hits: [
      {
        element: Element.Anemo,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      },
    ],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      addKitEffect(kitEffectState, createBogglecatField(body, combatant)),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(4),
    burstEnergyCost: burstMultiplier(5),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(10),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(9),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(6),
  };
};
