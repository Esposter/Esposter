import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Gaming's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's multiplier at 5 and its stamina at 6, and the plunges' collision, low and high at 8, 9 and 10. The skill group
// Holds Bestial Ascent's Charmed Cloudstrider DMG at 0, its Max HP drain at 1 and its cooldown at 2. The burst group holds
// Suanni's Gilded Dance's damage at 0, its heal at 1, its seconds at 2, its cooldown at 3 and its energy cost at 4
const GAMING_ATTACK_GROUP_ID = 9231;
const GAMING_SKILL_GROUP_ID = 9232;
const GAMING_BURST_GROUP_ID = 9239;

export const GAMING_CHARACTER_ID = 10_000_092;

// Measured: gcsim (MIT) gaming/attack.go, each strike's hitmark, the frame its action cancels at by default, the poise it
// Deals and its reach: a circle or fan one metre ahead of the body, a box spawned ahead of it, and a circle two metres
// Ahead. The second strike's fan is 270 degrees
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/gaming
const NORMAL_ATTACKS: {
  cancelFrames: number;
  hitArea: AttackArea;
  hitmarkFrames: number;
  index: number;
  poiseDamage: number;
}[] = [
  { cancelFrames: 39, hitArea: createCircleReach(1, 2), hitmarkFrames: 25, index: 0, poiseDamage: 112.133 },
  { cancelFrames: 46, hitArea: createFanReach(270, 1 + 2), hitmarkFrames: 18, index: 1, poiseDamage: 105.699 },
  { cancelFrames: 86, hitArea: createBoxReach(-1.7, 2.5, 4), hitmarkFrames: 34, index: 2, poiseDamage: 142.608 },
  { cancelFrames: 89, hitArea: createCircleReach(2, 2), hitmarkFrames: 48, index: 3, poiseDamage: 171.095 },
];

// Provisional: gcsim gives Gaming no charged attack, as its charge is not implemented, so the charged attack's frames and
// Reach are Ayato's measured claymore charge, and its multiplier and stamina are the table's at 5 and 6 until a recording
// Of the charged attack measures them
const CHARGED_ATTACK_FRAMES = 55;
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim (MIT) gaming/plunge.go, the collision at 37 frames, the low plunge at 43 with its animation at 84 and the
// High at 46 with its animation at 87. The collision is a circle of radius 1 round the body, and each plunge a circle one
// Metre ahead of it with its radius of 3 or 5, the low and high plunges' poise 150 and 200
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/gaming
const PLUNGE_COLLISION_HITMARK_FRAMES = 37;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1);
const LOW_PLUNGE_FRAMES = 84;
const LOW_PLUNGE_HITMARK_FRAMES = 43;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_FRAMES = 87;
const HIGH_PLUNGE_HITMARK_FRAMES = 46;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Measured: gcsim (MIT) gaming/skill.go, Bestial Ascent's animation at 64 frames, which strikes nothing of its own: its
// Damage is the Charmed Cloudstrider plunge that follows it, which the kit has no plunge variant to hold
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/gaming
const SKILL_FRAMES = 64;

// Measured: gcsim (MIT) gaming/burst.go, Suanni's Gilded Dance's animation at 77 frames and its one strike, a circle of
// Radius 5 round the body at 60 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/gaming
const BURST_FRAMES = 77;
const BURST_HITMARK_FRAMES = 60;
const BURST_HIT_AREA = createCircleReach(0, 5);

export const createGamingKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GAMING_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GAMING_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GAMING_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: [{ hitArea, hitmarkSeconds: hitmarkFrames / 60, poiseDamage, talentMultiplier: attackMultiplier(index) }],
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
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (
    hitArea: AttackArea,
    hitmarkFrames: number,
    animationFrames: number,
    poiseDamage: number,
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const elementalSkill: KitAction = { hits: [], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA };

  const burstHit: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(0),
  };
  const elementalBurst: KitAction = {
    hits: [burstHit],
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_POISE_DAMAGE,
      10,
    ),
    lowPlunge: createPlunge(
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_POISE_DAMAGE,
      9,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(2),
  };
};
