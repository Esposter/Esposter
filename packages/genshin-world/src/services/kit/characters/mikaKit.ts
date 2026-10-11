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
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Mika's proud skill groups, read at his talent level. The attack group holds his strikes' hits at 0 to 5, with the fourth
// Strike's two at 3 and 4 and the fifth at 5, the charged attack at 6 and its stamina at 7, and the plunges' collision, low
// And high at 8, 9 and 10. The skill group holds Flowfrost Arrow at 0, Rimestar Flare at 1, Rimestar Shard at 2, the ATK SPD
// Bonus at 3, its duration at 4 and its cooldown at 5. The burst group holds Skyfeather Song's initial heal's flat part at 0
// And its share of Max HP at 1, Eagleplume's flat and Max HP parts at 2 and 3, the heal's interval at 4, its duration at 5,
// Its cooldown at 6 and its energy cost at 7
const MIKA_ATTACK_GROUP_ID = 8031;
const MIKA_SKILL_GROUP_ID = 8032;
const MIKA_BURST_GROUP_ID = 8039;

// Measured: gcsim (MIT) mika/attack.go, each strike's hitmarks and the frames its action cancels at to walk. Each strike's
// Reach is its box or fan, offset as gcsim places it ahead of the body. gcsim gives Mika's strikes no poise, so each deals none
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/mika
const NORMAL_ATTACKS: {
  cancelFrames: number;
  hits: { hitArea: KitHit["hitArea"]; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 35, hits: [{ hitArea: createBoxReach(0, 1.8, 2.5), hitmarkFrames: 20, index: 0 }] },
  { cancelFrames: 28, hits: [{ hitArea: createFanReach(360, 0.2 + 1.6), hitmarkFrames: 14, index: 1 }] },
  { cancelFrames: 41, hits: [{ hitArea: createBoxReach(0.5, 2.5, 2.5), hitmarkFrames: 16, index: 2 }] },
  {
    cancelFrames: 48,
    hits: [
      { hitArea: createFanReach(45, 4 - 0.3), hitmarkFrames: 15, index: 3 },
      { hitArea: createFanReach(45, 4 - 0.3), hitmarkFrames: 24, index: 4 },
    ],
  },
  { cancelFrames: 71, hits: [{ hitArea: createBoxReach(1, 1.5, 5), hitmarkFrames: 30, index: 5 }] },
];

// Measured: gcsim (MIT) mika/charge.go, the charged attack's circle of radius 0.8 on the primary target at 26 frames, with its
// Animation at 66 frames
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/mika
const CHARGED_ATTACK_HITMARK_FRAMES = 26;
const CHARGED_ATTACK_FRAMES = 66;
const CHARGED_ATTACK_RADIUS = 0.8;

// Measured: gcsim (MIT) mika/skill.go, Flowfrost Arrow's box of 2.5 by 10 metres 0.4 metres behind the body at 17 frames, its
// Animation at 39 frames, and Rimestar Flare's single hit on the primary target at 12 frames, with its animation at 46 frames.
// Its Rimestar Shard, which strikes three random enemies, and the ATK SPD bonus to the team are not built: see the page
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/mika
const SKILL_PRESS_HITMARK_FRAMES = 17;
const SKILL_PRESS_FRAMES = 39;
const SKILL_PRESS_HIT_AREA = createBoxReach(-0.4, 2.5, 10);
const SKILL_HOLD_HITMARK_FRAMES = 12;
const SKILL_HOLD_FRAMES = 46;
// Provisional: gcsim centres the flare on the primary target alone, which this prices round the body at the skill's targeting
// Reach, as a single hit on a target is priced until areas hold targets
const SKILL_HOLD_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0);
// Provisional: gcsim's hold is a boolean with no threshold, so the flare takes the half second every hold level here takes
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT) mika/burst.go, Skyfeather Song's animation at 61 frames, and its initial heal at 51 frames, which gcsim
// Makes depend on ping and the kit takes as its constant. Its Eagleplume heals on each party member's normal attack are not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/mika
const BURST_FRAMES = 61;
const INITIAL_HEAL_FRAMES = 51;

// Provisional: gcsim gives Mika's plunges no file, so they take the shared plunge reach, land as their action starts, and run
// For this many seconds, as Rosaria's and Yaoyao's do
const PLUNGE_SECONDS = 0.4;

export const MIKA_CHARACTER_ID = 10_000_080;

// Mika's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Flowfrost Arrow with
// Rimestar Flare held, and Skyfeather Song's initial heal. The Rimestar Shard, Eagleplume's heals and the team's ATK SPD bonus
// Are not built, nor are his passives or constellations
export const createMikaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, MIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, MIKA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, MIKA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const skillPressHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: SKILL_PRESS_HIT_AREA,
    hitmarkSeconds: SKILL_PRESS_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(0),
  };

  // Its initial heal lands on the active character as its animation's 51st frame, and the field that carries it ticks once
  // Then, healing by its flat part plus its share of the healer's Max HP
  const createInitialHealField = (body: KitBody, combatant: Combatant): KitField => {
    const flatHeal = burstMultiplier(0);
    const maxHealthShare = burstMultiplier(1);
    return createKitField(combatant.characterId, body.position, {
      nextTickSeconds: INITIAL_HEAL_FRAMES / 60,
      onTick: (tick) =>
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          flatHeal + maxHealthShare * combatant.attributes.maxHealth,
        ),
      secondsRemaining: 1,
      tickIntervalSeconds: 1,
    });
  };

  return {
    burstCooldownSeconds: burstMultiplier(6),
    burstEnergyCost: burstMultiplier(7),
    chargedAttack: {
      hits: [
        {
          hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        addKitEffect(kitEffectState, createInitialHealField(body, combatant));
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [skillPressHit], seconds: SKILL_PRESS_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkillHolds: [
      {
        action: {
          hits: [
            {
              element: Element.Cryo,
              gauge: 1,
              hitArea: SKILL_HOLD_HIT_AREA,
              hitmarkSeconds: SKILL_HOLD_HITMARK_FRAMES / 60,
              poiseDamage: 0,
              talentMultiplier: skillMultiplier(1),
            },
          ],
          seconds: SKILL_HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: skillMultiplier(5),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(10) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(9) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
