import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Hu Tao's proud skill groups, read at her talent level. The attack group holds the string's hits at 0 to 6, the charged
// Attack at 7 and its stamina at 8, and the plunges' collision, low and high at 9, 10 and 11, with N5's two hits at 4 and
// 5. The skill group holds Guide to Afterlife's HP share at 0, its ATK share of Max HP at 1, its Blood Blossom at 2, the
// Paramita's seconds at 4 and the skill's cooldown at 5. The burst group holds Spirit Soother's hit at 0, its hit under half
// HP at 1, its heal's share of Max HP at 2 and under half HP at 3, its cooldown at 4, its energy cost at 5 and its half HP
// Threshold at 6
const HU_TAO_ATTACK_GROUP_ID = 4631;
const HU_TAO_SKILL_GROUP_ID = 4632;
const HU_TAO_BURST_GROUP_ID = 4639;

// A circle's reach as a kit prices it: a circle of the radius on the body, its offset already in the radius
const circle = (radius: number): AttackArea => Object.freeze({ angle: 2 * Math.PI, height: 2, radius });

// Measured: gcsim v2.47.2 (MIT) hutao/attack.go, each strike of the standard stance's string, its hitmarks, its attack
// Cancel frame and its reach, each priced as its offset plus its radius for a circle, and as its far corner for a box
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/attack.go
const STANDARD_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 14, hits: [{ hitArea: circle(0.8 + 1.8), hitmarkFrames: 12, index: 0 }] },
  { cancelFrames: 12, hits: [{ hitArea: circle(Math.hypot(3 - 0.1, 1.5 / 2)), hitmarkFrames: 9, index: 1 }] },
  { cancelFrames: 23, hits: [{ hitArea: circle(1.1 + 2), hitmarkFrames: 17, index: 2 }] },
  { cancelFrames: 29, hits: [{ hitArea: circle(2.4 + 1.8), hitmarkFrames: 22, index: 3 }] },
  {
    cancelFrames: 37,
    hits: [
      { hitArea: circle(0.5 + 1.8), hitmarkFrames: 16, index: 4 },
      { hitArea: circle(Math.hypot(0.3 + 3, 2 / 2)), hitmarkFrames: 26, index: 5 },
    ],
  },
  { cancelFrames: 72, hits: [{ hitArea: circle(1.1 + 2.3), hitmarkFrames: 23, index: 6 }] },
];

// Measured: gcsim v2.47.2 (MIT) hutao/attack.go, the Paramita Papilio stance's strikes, each with its own reach and cancel,
// Which it plays in place of the standard string while the stance holds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/attack.go
const PARAMITA_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 14, hits: [{ hitArea: circle(0.8 + 2.3), hitmarkFrames: 12, index: 0 }] },
  { cancelFrames: 12, hits: [{ hitArea: circle(Math.hypot(3 - 0.1, 1.9 / 2)), hitmarkFrames: 9, index: 1 }] },
  { cancelFrames: 23, hits: [{ hitArea: circle(1.1 + 2.6), hitmarkFrames: 17, index: 2 }] },
  { cancelFrames: 29, hits: [{ hitArea: circle(2.4 + 2.2), hitmarkFrames: 22, index: 3 }] },
  {
    cancelFrames: 36,
    hits: [
      { hitArea: circle(0.5 + 2.3), hitmarkFrames: 15, index: 4 },
      { hitArea: circle(Math.hypot(0.3 + 3.2, 2.2 / 2)), hitmarkFrames: 26, index: 5 },
    ],
  },
  { cancelFrames: 72, hits: [{ hitArea: circle(1.1 + 2.8), hitmarkFrames: 27, index: 6 }] },
];

// Measured: gcsim v2.47.2 (MIT) hutao/charge.go, the charged attack's circle of radius 0.8 round the body at 19 frames, its
// Animation at 62 frames and its cancel at 57. The Paramita stance's charged attack lands at 3 frames of 42
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 });
const CHARGED_HITMARK_FRAMES = 19;
const CHARGED_ANIMATION_FRAMES = 62;
const PARAMITA_CHARGED_HITMARK_FRAMES = 3;
const PARAMITA_CHARGED_ANIMATION_FRAMES = 42;

// Measured: gcsim v2.47.2 (MIT) hutao/skill.go, Guide to Afterlife's Paramita Papilio at 14 frames of a 52-frame animation, its
// Cooldown of 960 frames and its Pyro infusion and ATK share of Max HP
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/skill.go
const SKILL_ANIMATION_FRAMES = 52;
const PARAMITA_SOURCE = "hu-tao-paramita";
// Guide to Afterlife's HP cost never takes Hu Tao below this much HP
const GUIDE_MINIMUM_HP = 1;

// Measured: gcsim v2.47.2 (MIT) hutao/burst.go, Spirit Soother's circle of radius 6 round the body at 66 frames of a 98-frame
// Animation, with its cooldown and energy cost in the table
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/burst.go
const SPIRIT_SOOTHER_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
const SPIRIT_SOOTHER_HITMARK_FRAMES = 66;
const SPIRIT_SOOTHER_ANIMATION_FRAMES = 98;

// Measured: gcsim v2.47.2 (MIT) hutao/skill.go, Blood Blossom's status for 570 frames, ticking every 240 frames on the one
// Enemy it is put on, each tick a Pyro hit of durability 25, which is 1U. The Paramita's charged attack puts it on the enemies
// It hits, from gcsim's hutao/charge.go. The tick's hit lands a frame after the tick, as Tartaglia's riptide's do
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/skill.go
const BLOOD_BLOSSOM_STATUS_ID = "hu-tao-blood-blossom";
const BLOOD_BLOSSOM_SECONDS = 570 / 60;
const BLOOD_BLOSSOM_INTERVAL_SECONDS = 240 / 60;
const BLOOD_BLOSSOM_GAUGE = 1;
const BLOOD_BLOSSOM_HITMARK_SECONDS = 1 / 60;
// Blood Blossom on an enemy, which the Paramita's charged attack gives each enemy it hits
const createBloodBlossomStatus = (): EnemyStatus => ({
  damageTakenBonus: 0,
  id: BLOOD_BLOSSOM_STATUS_ID,
  nextTickSeconds: BLOOD_BLOSSOM_INTERVAL_SECONDS,
  secondsRemaining: BLOOD_BLOSSOM_SECONDS,
  tickIntervalSeconds: BLOOD_BLOSSOM_INTERVAL_SECONDS,
});
// Provisional: gcsim gives Hu Tao's strikes, charged attack, skill and burst no poise, so each deals none until the wiki's
// Advanced properties are measured
const NO_POISE_DAMAGE = 0;
// Provisional: the plunges' frames are not fetched from gcsim, so they are provisional until the Mac measures them
const PLUNGE_SECONDS = 0.4;

export const HU_TAO_CHARACTER_ID = 10_000_046;

// Hu Tao's first kit, at talent level 1: a six-strike string with its seventh hit, a charged attack, a collision and two
// Plunges, and Guide to Afterlife's Paramita Papilio stance. It infuses her attacks with Pyro and adds ATK from her Max HP
// It lasts its seconds, and Spirit Soother's hit with its half HP variant. Her multipliers are read from her proud skill
// Groups. Her HP cost is paid from the party, and Blood Blossom is put on the enemies the Paramita's charged attack hits and
// Ticks on each. Spirit Soother's heal, her passives and her constellations are not built
export const createHuTaoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HU_TAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HU_TAO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HU_TAO_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const paramitaSeconds = skillTalentMultiplier(4);

  const createStrikeAction = (strike: (typeof STANDARD_STRIKES)[number]): KitAction => ({
    hits: strike.hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: strike.cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const normalAttacks = STANDARD_STRIKES.map((strike) => createStrikeAction(strike));
  const paramitaNormalAttacks = PARAMITA_STRIKES.map((strike) => createStrikeAction(strike));

  // Blood Blossom's tick, a Pyro hit on the one enemy it is put on, priced by Hu Tao's skill multiplier at index 2
  const bloodBlossomHit: KitHit = {
    element: Element.Pyro,
    gauge: BLOOD_BLOSSOM_GAUGE,
    hitArea: circle(0),
    hitmarkSeconds: BLOOD_BLOSSOM_HITMARK_SECONDS,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(2),
  };

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_HIT_AREA,
        hitmarkSeconds: CHARGED_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(7),
      },
    ],
    seconds: CHARGED_ANIMATION_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };
  const paramitaChargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_HIT_AREA,
        enemyStatus: createBloodBlossomStatus,
        hitmarkSeconds: PARAMITA_CHARGED_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(7),
      },
    ],
    seconds: PARAMITA_CHARGED_ANIMATION_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createSpiritSoother = (talentMultiplier: number): KitAction => ({
    hits: [
      {
        element: Element.Pyro,
        hitArea: SPIRIT_SOOTHER_HIT_AREA,
        hitmarkSeconds: SPIRIT_SOOTHER_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier,
      },
    ],
    seconds: SPIRIT_SOOTHER_ANIMATION_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  });
  const spiritSoother = createSpiritSoother(burstTalentMultiplier(0));
  const lowHealthSpiritSoother = createSpiritSoother(burstTalentMultiplier(1));

  // Guide to Afterlife's Paramita Papilio: a stance on her for its seconds, playing her strikes and charged attack in its
  // Own reach, which infuses her normal attacks, charged attack and plunges with Pyro, and raises her ATK by her Max HP
  const paramitaActions = {
    chargedAttack: paramitaChargedAttack,
    chargedAttackStamina: attackTalentMultiplier(8),
    elementalBurst: spiritSoother,
    elementalSkill: { hits: [], seconds: SKILL_ANIMATION_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    normalAttacks: paramitaNormalAttacks,
  };
  const createParamitaStance = (characterId: number): KitStance => ({
    actions: paramitaActions,
    characterId,
    elapsedSeconds: 0,
    kind: "stance",
    secondsRemaining: paramitaSeconds,
  });
  const createPyroInfusion = (characterId: number): KitEffect => ({
    characterId,
    element: Element.Pyro,
    kind: "infusion",
    secondsRemaining: paramitaSeconds,
  });

  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    chargedAttack,
    chargedAttackStamina: attackTalentMultiplier(8),
    elementalBurst: spiritSoother,
    elementalBurstVariant: {
      action: lowHealthSpiritSoother,
      checkIsActive: ({ combatant, party }) =>
        getPartyMember(party, combatant.characterId).healthShare <= burstTalentMultiplier(6),
    },
    elementalSkill: {
      hits: [],
      onStart: ({ combatant, kitEffectState, party }) => {
        // Guide to Afterlife takes its HP share of her current HP, but never below GUIDE_MINIMUM_HP
        const { healthShare } = getPartyMember(party, combatant.characterId);
        const minimumHealthShare = GUIDE_MINIMUM_HP / combatant.attributes.maxHealth;
        const lostHealthShare = Math.max(
          0,
          Math.min(skillTalentMultiplier(0) * healthShare, healthShare - minimumHealthShare),
        );
        damagePartyMember(party, combatant.characterId, lostHealthShare);
        addKitEffect(kitEffectState, createParamitaStance(combatant.characterId));
        addKitEffect(kitEffectState, createPyroInfusion(combatant.characterId));
        addKitEffect(kitEffectState, {
          amount: skillTalentMultiplier(1) * combatant.attributes.maxHealth,
          attribute: Attribute.Attack,
          characterId: combatant.characterId,
          kind: "buff",
          secondsRemaining: paramitaSeconds,
          source: PARAMITA_SOURCE,
        });
      },
      seconds: SKILL_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(11),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    onKitEvent: (event, { combatant, kitEffectState }) => {
      if (event.kind !== KitEventKind.StatusTicked || event.status.id !== BLOOD_BLOSSOM_STATUS_ID) return;
      const tick = createKitSummon({ facing: 0, height: 0, position: event.enemy.position }, combatant, [
        bloodBlossomHit,
      ]);
      addKitEffect(kitEffectState, { ...tick, target: event.enemy });
    },
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds: skillTalentMultiplier(5),
  };
};
