import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Aino's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack's hit at 4 and its stamina at 5, and the plunges' collision, low and high at 7, 8 and 9. The skill group holds
// Musecatcher's two stages at 0 and 1 and the skill's cooldown at 2. The burst group holds Cool Your Jets Ducky's damage
// At 0, its duration at 1, its cooldown at 2 and its energy cost at 3
const AINO_ATTACK_GROUP_ID = 12131;
const AINO_SKILL_GROUP_ID = 12132;
const AINO_BURST_GROUP_ID = 12139;

export const AINO_CHARACTER_ID = 10_000_121;

// Measured: gcsim (MIT) aino/attack.go, each strike's hitmark, the frame its action cancels at by default, its poise, and
// Its circle or box round the body. The third strike's first hit is a box of 2.5 by 3.5 metres, and its second a circle
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const NORMAL_ATTACKS = [
  { cancelFrames: 48, hits: [{ hitArea: createCircleReach(0.5, 2), hitmarkFrames: 23, poiseDamage: 88.923 }] },
  { cancelFrames: 75, hits: [{ hitArea: createCircleReach(0.8, 2), hitmarkFrames: 20, poiseDamage: 88.512 }] },
  {
    cancelFrames: 93,
    hits: [
      { hitArea: createBoxReach(-1, 2.5, 3.5), hitmarkFrames: 35, poiseDamage: 48.3 },
      { hitArea: createCircleReach(0.5, 2), hitmarkFrames: 43, poiseDamage: 48.3 },
    ],
  },
];

// Provisional: gcsim gives Aino no charged attack, as its charge is not implemented, so the charged attack takes Ayato's
// Measured claymore charge's frames and reach, the same as Gaming's, and the table's multiplier and stamina at 4 and 5.
// Its stamina is the table's; its frames and reach wait on a recording of the attack
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const CHARGED_ATTACK_FRAMES = 55;
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Provisional: Aino's gcsim folder has no plunge file, so her plunges take the timings and poise of Bennett's, as Lauma's
// Do. Her multipliers are her own table's
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) aino/skill.go, Musecatcher's first stage on the primary target with a circle of radius 1.2 at its
// Hitmark of 15 frames, and its second stage round the body, a circle of radius 3.5 1.2 metres ahead at 33 frames, in an
// Animation of 52 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const SKILL_FRAMES = 52;
const SKILL_FIRST_HITMARK_FRAMES = 15;
const SKILL_SECOND_HITMARK_FRAMES = 33;
const SKILL_FIRST_HIT_AREA = createCircleReach(0, 1.2);
const SKILL_SECOND_HIT_AREA = createCircleReach(1.2, 3.5);

// Measured: gcsim (MIT) aino/burst.go, Cool Your Jets Ducky's animation at 60 frames. Its Water Balls fall every 90 frames
// From 123 frames for 14.2 seconds, ten of them, each landing 10 frames after it falls, on a random enemy within 10 metres
// Of the body. Ascension 1's faster and wider balls wait on the Moonsign, which the kit does not hold yet
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const BURST_FRAMES = 60;
const BURST_FIRST_TICK_FRAMES = 123;
const BURST_TICK_INTERVAL_FRAMES = 90;
const BURST_HIT_DELAY_FRAMES = 10;
const BURST_SECONDS = 14.2;
const BURST_AREA_RADIUS = 10;
const BURST_HIT_RADIUS = 1;
// The enemy a ball picks is not drawn by the kit, so each ball's reach is the area it could land in, as Ayato's ticks do
const BURST_HIT_AREA = createCircleReach(0, BURST_AREA_RADIUS + BURST_HIT_RADIUS);
const ASCENSION_4 = 4;
const ASCENSION_4_MASTERY_SHARE = 0.5;

const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// Not built yet: Aino's Ascension 1 at a Moonsign of 2, which shortens the balls' interval and widens them, and Constellation 6's
// Lunar DMG bonus, both wait on the Lunar and Moonsign hook; Constellation 2's ball on each enemy another member hits while
// The burst lasts, which waits on a hook that reads another member's hits; Constellation 1's Elemental Mastery on the
// Active member and Constellation 4's energy on the skill's hits, which the kit does not hold yet; and Aino's passives.
// Musecatcher's hold is not built, as gcsim does not implement it either.
export const createAinoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AINO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AINO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AINO_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }, strikeIndex): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, poiseDamage }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage,
      talentMultiplier: attackMultiplier(strikeIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: SKILL_FIRST_HIT_AREA,
        hitmarkSeconds: SKILL_FIRST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: SKILL_SECOND_HIT_AREA,
        hitmarkSeconds: SKILL_SECOND_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(1),
      },
    ],
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Ascension 4 adds half her Elemental Mastery to each Water Ball's damage
  const burstHit: KitHit = {
    additiveBaseDamageBonus: (combatant: Combatant): number =>
      combatant.ascension >= ASCENSION_4
        ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * ASCENSION_4_MASTERY_SHARE
        : 0,
    element: Element.Hydro,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HIT_DELAY_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(0),
  };

  // The burst's field follows the body and drops a Water Ball every interval, from the first tick to its last
  const createBurstField = (body: KitBody, combatant: Combatant): KitField => {
    const burstField: KitField = {
      centre: { x: body.position.x, z: body.position.z },
      characterId: combatant.characterId,
      isFollowing: true,
      kind: "field",
      nextTickSeconds: BURST_FIRST_TICK_FRAMES / 60,
      onTick: ({ kitEffectState }) =>
        addKitEffect(
          kitEffectState,
          createKitSummon({ facing: body.facing, height: body.height, position: burstField.centre }, combatant, [
            burstHit,
          ]),
        ),
      radius: BURST_AREA_RADIUS,
      secondsRemaining: BURST_FIRST_TICK_FRAMES / 60 + BURST_SECONDS,
      tickIndex: 0,
      tickIntervalSeconds: BURST_TICK_INTERVAL_FRAMES / 60,
    };
    return burstField;
  };

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      addKitEffect(kitEffectState, createBurstField(body, combatant)),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(9),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: skillMultiplier(2),
  };
};
