import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Baizhu's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Universal
// Diagnosis' damage at 0 and its cooldown at 3. The burst group holds the seamless shield's share of Max HP at 0 and its flat
// Shield at 1, the heal's share and flat at 4 and 5, Spiritvein's damage at 6, the burst's cooldown at 8 and its energy cost at 9
const BAIZHU_ATTACK_GROUP_ID = 8231;
const BAIZHU_SKILL_GROUP_ID = 8232;
const BAIZHU_BURST_GROUP_ID = 8239;

// Measured: gcsim (MIT) baizhu/attack.go, each strike's hitmarks, the frame its action cancels at by default and its box.
// The third strike's two hits both take its multiplier
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
const NORMAL_ATTACKS = [
  { cancelFrames: 33, hitArea: createBoxReach(-0.2, 2, 3), hitmarkFrames: [17] },
  { cancelFrames: 39, hitArea: createBoxReach(-0.2, 2, 3), hitmarkFrames: [25] },
  { cancelFrames: 46, hitArea: createBoxReach(-0.2, 2.4, 3), hitmarkFrames: [23, 35] },
  { cancelFrames: 67, hitArea: createBoxReach(-0.2, 3.2, 3), hitmarkFrames: [30] },
];

// Measured: gcsim (MIT) baizhu/charge.go, the charged attack's circle of radius 2.3 round the target at 59 frames, with its
// Animation at 75 frames. gcsim takes 14 frames off both when it starts from a normal attack, which this kit does not
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
const CHARGED_ATTACK_FRAMES = 75;
const CHARGED_ATTACK_HITMARK_FRAMES = 59;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2.3);

// Provisional: Baizhu's gcsim folder has no plunge file, so his plunges take the timings and poise of Bennett's, as the shared
// Plunge hit areas do (gcsim v2.47.2 bennett/plunge.go). His multipliers are his own table's
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) baizhu/skill.go, Universal Diagnosis' first hit as a circle of radius 0.6 round the target at 13
// Frames, its animation at 49 frames. Its later bounces to the next enemy and its heal at the chain's end are not built
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
const SKILL_FRAMES = 49;
const SKILL_HITMARK_FRAMES = 13;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0.6);

// Measured: gcsim (MIT) baizhu/burst.go, Holistic Revivification's animation at 105 frames. Its seamless shield lands at 81
// Frames and lasts 152 frames, and it is recast over at 223 frames and every 146 frames after, five times in all, each
// Recast exploding the shield it replaces. The kit sets the first shield at the cast, lasting to its gcsim expiry, which is
// The gap-free window gcsim gives it, and sets the recasts on a field that ticks on that schedule wherever the body stands
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
const BURST_FRAMES = 105;
const BURST_SHIELD_FRAMES = 152;
const BURST_FIRST_SHIELD_FRAMES = 81;
const BURST_FIRST_REFRESH_FRAMES = BURST_FIRST_SHIELD_FRAMES + 142;
const BURST_REFRESH_INTERVAL_FRAMES = 146;
const BURST_REFRESH_COUNT = 5;
const BURST_LAST_REFRESH_FRAMES =
  BURST_FIRST_REFRESH_FRAMES + BURST_REFRESH_INTERVAL_FRAMES * (BURST_REFRESH_COUNT - 1);
const BURST_FIRST_SHIELD_SECONDS = (BURST_FIRST_SHIELD_FRAMES + BURST_SHIELD_FRAMES) / 60;
// Spiritvein lands from the body on the field, which is the one place a shield's explosion can be priced from, so it reaches
// Every enemy within the skill's reach where gcsim picks the primary target, which overstates it against several enemies
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
const SPIRITVEIN_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1.5);

// Not built yet: his first constellation's extra charge of Universal Diagnosis, Constellations 2 to 6, Gossamer Sprite's
// Bounces and healing, the Seamless Shield's heals and its removal's heal, and the Ascension passives, which read the wearer's
// HP and the reactions the team deals. Each waits on the hook named where it is written.
export const BAIZHU_CHARACTER_ID = 10_000_082;

const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createBaizhuKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, BAIZHU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, BAIZHU_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, BAIZHU_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, strikeIndex): KitAction => ({
      hits: hitmarkFrames.map((frames) => ({
        hitArea,
        hitmarkSeconds: frames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(strikeIndex),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // The shield's explosion, Spiritvein, is priced by its casting character as the body stands on the field when it goes off
  const createSpiritvein = (): KitHit => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: SPIRITVEIN_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(6),
  });

  // The shield a cast or a recast sets on the team, its health the share of Max HP plus its flat amount, and its explosion
  const createShield = (combatant: Combatant, secondsRemaining: number): KitShield => ({
    characterId: combatant.characterId,
    element: Element.Dendro,
    explosion: { combatant, hit: createSpiritvein() },
    health: burstMultiplier(0) * combatant.attributes.maxHealth + burstMultiplier(1),
    kind: "shield",
    secondsRemaining,
  });

  // The field recasts the shield at each refresh, from wherever the body stands, so its radius reaches every body
  const createRefreshField = (body: KitBody, combatant: Combatant): KitField => ({
    centre: { x: body.position.x, z: body.position.z },
    characterId: combatant.characterId,
    kind: "field",
    nextTickSeconds: BURST_FIRST_REFRESH_FRAMES / 60,
    onTick: ({ kitEffectState }) => addKitEffect(kitEffectState, createShield(combatant, BURST_SHIELD_FRAMES / 60)),
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: (BURST_LAST_REFRESH_FRAMES + 1) / 60,
    tickIndex: 0,
    tickIntervalSeconds: BURST_REFRESH_INTERVAL_FRAMES / 60,
  });

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ body, combatant, kitEffectState }) => {
      addKitEffect(kitEffectState, createShield(combatant, BURST_FIRST_SHIELD_SECONDS));
      addKitEffect(kitEffectState, createRefreshField(body, combatant));
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Dendro,
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

  return {
    burstCooldownSeconds: burstMultiplier(8),
    burstEnergyCost: burstMultiplier(9),
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
        talentMultiplier: attackMultiplier(8),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(7),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(3),
  };
};
