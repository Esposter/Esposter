import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Lauma's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack, Spiritcall Prayer, at 8, and the plunges' collision, low and high at 9, 10 and 11. The skill group holds
// Hymn of Hunting's press at 0, the Frostgrove Sanctuary's damage and Elemental Mastery at 3 and 4, the Elemental RES
// Decrease at 7 and the skill's cooldown at 9. The burst group holds Pale Hymn's cooldown at 5 and its energy cost at 6
const LAUMA_ATTACK_GROUP_ID = 11931;
const LAUMA_SKILL_GROUP_ID = 11932;
const LAUMA_BURST_GROUP_ID = 11939;

// Measured: gcsim (MIT) lauma/attack.go, each strike's hitmark, the frame its action cancels at by default, and its box of
// Width and length round the body. The third strike's box is 2.8 metres wide
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const NORMAL_ATTACKS = [
  { cancelFrames: 29, hitArea: createBoxReach(0, 2, 8), hitmarkFrames: 14 },
  { cancelFrames: 33, hitArea: createBoxReach(0, 2, 8), hitmarkFrames: 11 },
  { cancelFrames: 38, hitArea: createBoxReach(0, 2.8, 8), hitmarkFrames: 16 },
];

// Measured: gcsim (MIT) lauma/charge.go, Spiritcall Prayer's box of 2.8 by 8 metres, its hitmark at 73 frames, which lands
// After its animation's 68 frames. Its stamina is not drained outside the Spirit Envoy state, so it costs none
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const CHARGED_ATTACK_FRAMES = 68;
const CHARGED_ATTACK_HITMARK_FRAMES = 73;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(0, 2.8, 8);
const CHARGED_ATTACK_STAMINA = 0;

// Provisional: Lauma's gcsim folder has no plunge file, so her plunges take the timings and poise of Bennett's, as Nahida's
// Do. Her multipliers are her own table's
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) lauma/skill.go, Hymn of Hunting's press with its circle of radius 6 round the body, its hitmark at 16
// Frames and its animation at 42. Its Frostgrove Sanctuary plants a circle of radius 6 round the body where it is cast,
// Ticking eight times from 62 frames at an interval of 117, for 15 seconds, and each of its ticks sheds the RES below
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const SKILL_PRESS_HITMARK_FRAMES = 16;
const SKILL_PRESS_FRAMES = 42;
const SKILL_HIT_AREA = createCircleReach(0, 6);
const SANCTUARY_FIRST_TICK_FRAMES = 62;
const SANCTUARY_TICK_INTERVAL_FRAMES = 117;
const SANCTUARY_TICK_COUNT = 8;
const SANCTUARY_SECONDS = 15;
const SHRED_SECONDS = 10;
const SHRED_STATUS_ID = "lauma-skill-shred";

// Measured: gcsim (MIT) lauma/burst.go, Pale Hymn's animation at 115 frames. Lauma's burst lands no hit of its own: its
// Pale Hymn is a buff on the Bloom and Lunar-Bloom hits that follow it, which the kit does not yet hold
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const BURST_FRAMES = 115;

// Not built yet: Hymn of Eternal Rest, whose release needs Dew and whose second hit is a Lunar-Bloom; Pale Hymn's buff on
// Bloom and Lunar-Bloom hits, which waits on the reaction hooks; the Spirit Envoy state entered by the charged attack's
// First press, which waits on a stance that drains stamina; and Lauma's passives and constellations.
export const LAUMA_CHARACTER_ID = 10_000_119;

// Lauma's first kit, at talent level 1: three strikes, Spiritcall Prayer, a collision and two plunges, and Hymn of Hunting's
// Press with the Frostgrove Sanctuary it plants and the RES it sheds. Hymn of Eternal Rest, Pale Hymn and the Spirit
// Envoy are not built, nor are her passives
const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createLaumaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAUMA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAUMA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAUMA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, index): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(8),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // The RES Dendro and Hydro enemies lose to a hit of the skill's, for its seconds
  const createShredStatus = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: SHRED_STATUS_ID,
    resistanceReduction: { [Element.Dendro]: skillMultiplier(7), [Element.Hydro]: skillMultiplier(7) },
    secondsRemaining: SHRED_SECONDS,
  });

  // The Frostgrove Sanctuary's tick, a Dendro hit of the sanctuary's ATK share and its Elemental Mastery, which sheds RES
  const createSanctuaryTick = (tickIndex: number): KitHit => ({
    additiveBaseDamageBonus: (striker: Combatant) =>
      striker.attributes.attributeTotalMap[Attribute.ElementalMastery] * skillMultiplier(4),
    element: Element.Dendro,
    enemyStatus: createShredStatus,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: (SANCTUARY_FIRST_TICK_FRAMES + SANCTUARY_TICK_INTERVAL_FRAMES * tickIndex) / 60,
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(3),
  });

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Dendro,
        enemyStatus: createShredStatus,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_PRESS_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: ({ body, combatant, kitEffectState }) => {
      addKitEffect(
        kitEffectState,
        createKitSummon(
          body,
          combatant,
          Array.from({ length: SANCTUARY_TICK_COUNT }, (_tick, tickIndex) => createSanctuaryTick(tickIndex)),
          SANCTUARY_SECONDS,
        ),
      );
    },
    seconds: SKILL_PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(5),
    burstEnergyCost: burstMultiplier(6),
    chargedAttack,
    chargedAttackStamina: CHARGED_ATTACK_STAMINA,
    elementalBurst: { hits: [], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill,
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(11),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(10),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(9),
    },
    skillCooldownSeconds: skillMultiplier(9),
  };
};
