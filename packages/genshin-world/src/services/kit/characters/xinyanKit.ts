import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Xinyan's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's two hits at 4 and 5 and its stamina at 6, and the plunges' collision, low and high at 8, 9 and 10. The skill
// Group holds Sweeping Fervor's hit at 0, the shield's share of DEF and flat HP at each level from 1 to 3 at 1 to 6, the
// Field's Pyro DoT at 7, the shield's seconds at 8 and the cooldown at 9. The burst group holds Riff Revolution's hit at 0,
// Its Pyro DoT at 1, its cooldown at 2 and its energy cost at 3
const XINYAN_ATTACK_GROUP_ID = 4431;
const XINYAN_SKILL_GROUP_ID = 4432;
const XINYAN_BURST_GROUP_ID = 4439;

// Measured: gcsim v2.47.2 (MIT) xinyan/attack.go, each strike's hitmark, its cancel frame, its reach and its poise. Each
// Reach is a fan or box centred ahead of the body, so each is priced as its far reach from the body. The strikes are blunt
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/attack.go
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hitArea: AttackArea;
  hitmarkFrames: number;
  poiseDamage: number;
}[] = [
  { cancelFrames: 33, hitArea: createFanReach(270, 0.5 + 2), hitmarkFrames: 25, poiseDamage: 96.6 },
  { cancelFrames: 39, hitArea: createBoxReach(0, 2, 2.5), hitmarkFrames: 27, poiseDamage: 93.15 },
  { cancelFrames: 64, hitArea: createFanReach(360, 1 + 2), hitmarkFrames: 47, poiseDamage: 121.9 },
  { cancelFrames: 94, hitArea: createFanReach(270, 1 + 2), hitmarkFrames: 35, poiseDamage: 146.63 },
];

// Provisional: gcsim has no charged attack for Xinyan (its TODO), so the two hits stand in as her fourth strike, its reach,
// Hitmark and animation, and carry no poise, until a recording of the attack measures them
const CHARGED_ATTACK_FRAMES = 94;
const CHARGED_ATTACK_HITMARK_FRAMES = 35;
const CHARGED_ATTACK_HIT_AREA = createFanReach(270, 1 + 2);
const CHARGED_ATTACK_POISE_DAMAGE = 0;

// Measured: gcsim v2.47.2 (MIT) xinyan/skill.go, Sweeping Fervor's circle of radius 3 one metre ahead of the body at 15
// Frames, of poise 200 and blunt, in an animation of 62 frames. Its cooldown and shield come from the table
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/skill.go
const SKILL_FRAMES = 62;
const SKILL_HITMARK_FRAMES = 15;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1 + 3);
const SKILL_POISE_DAMAGE = 200;
// The count Sweeping Fervor keeps as it strikes lasts this long past the press, long enough for its one hit to strike
// Every enemy it reaches
const SKILL_HIT_WINDOW_SECONDS = 0.5;
// The shield's level is raised by the enemies Sweeping Fervor hits: Lead-In at 2 and Rave at 3, Ascension 1 lowering each
// By one, and the shield stands at level 1 without one
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/xinyan.go
const LEAD_IN_ENEMY_COUNT = 2;
const RAVE_ENEMY_COUNT = 3;
const ASCENSION_SHIELD_REQUIREMENT_ASCENSION = 1;
const SHIELD_LEVEL_ONE = 1;
const SHIELD_LEVEL_TWO = 2;
const SHIELD_LEVEL_THREE = 3;
// Rave's DoT strikes every 2 seconds while the shield stands at level 3, from the second after it is set
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/skill.go
const SHIELD_DOT_INTERVAL_SECONDS = 2;
const SHIELD_DOT_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 3);
// A summon's hit lands a frame after the summon is cast, as its hits fall after its cast and a step's tick is its first
const SUMMON_HIT_SECONDS = 1 / 60;
// The field lives a tenth of a second past its last tick, so the step that runs it still has it
const FIELD_LINGER_SECONDS = 0.1;
const SHIELD_LEVEL_STATUS_ID = "xinyan-shield-level";
const HIT_COUNT_STATUS_ID = "xinyan-sweeping-fervor-hits";
const SHIELD_DOT_FIELD_ID = "xinyan-shield-dot";
// Provisional: gcsim gives the shield's DoT and the burst's Physical hit no poise, so these stand in until a source gives them
const SHIELD_DOT_POISE_DAMAGE = 0;
const BURST_INITIAL_POISE_DAMAGE = 0;
const DOT_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 0;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Measured: gcsim v2.47.2 (MIT) xinyan/burst.go, Riff Revolution's Physical circle of radius 3 at 22 frames and its Pyro
// Ticks: a circle of radius 4 one metre ahead of the body at 57 frames and then 74 and every 17 frames after, seven in all.
// The animation is 87 frames. Its shield at Constellation 2 is set as the burst is cast, and its two extra DoT pulses land
// At 65 and 83 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/burst.go
const BURST_FRAMES = 87;
const BURST_INITIAL_HITMARK_FRAMES = 22;
const BURST_INITIAL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 3);
const BURST_DOT_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 2 + 4);
const BURST_DOT_HITMARK_FRAMES = [57, 74, 91, 108, 125, 142, 159];
const CONSTELLATION_PULSE_HITMARK_FRAMES = [65, 83];

// Constellation gates, as gcsim v2.47.2 (MIT) gives them: 1's ATK SPD is not built, as the kit's normal attack speed reads
// Only an infusion's, 2's Riff Revolution CRIT Rate and shield, and 4's Physical RES cut. Constellation 6 has no gcsim
// Implementation, so it is not built
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/cons.go
const CRITICAL_RATE_CONSTELLATION = 2;
const SHIELD_ON_BURST_CONSTELLATION = 2;
const PHYSICAL_RESISTANCE_CONSTELLATION = 4;
const RIFF_CRITICAL_RATE_BONUS = 1;
const RIFF_CRITICAL_RATE_SOURCE = "xinyan-riff-revolution";
const PHYSICAL_RESISTANCE_REDUCTION = 0.15;
const PHYSICAL_RESISTANCE_SECONDS = 12;
const PHYSICAL_RESISTANCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "xinyan-c4",
  physicalResistanceReduction: PHYSICAL_RESISTANCE_REDUCTION,
  secondsRemaining: PHYSICAL_RESISTANCE_SECONDS,
};
const getPhysicalResistanceStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= PHYSICAL_RESISTANCE_CONSTELLATION ? PHYSICAL_RESISTANCE_STATUS : undefined;

// Plunge poise and reach, the wiki's plunges at gcsim's radii: 3 and 5 metres round the body one metre ahead, and a collision
// Of 1 metre. gcsim's are 150 and 200 poise
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 1 + 3);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 1 + 5);
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1 + 1);

// The level of Sweeping Fervor's shield a count of enemies hit raises it to, lowered by Ascension 1
const getRequiredShieldLevel = (hitCount: number, ascension: number): number => {
  const reduction = ascension >= ASCENSION_SHIELD_REQUIREMENT_ASCENSION ? 1 : 0;
  if (hitCount >= RAVE_ENEMY_COUNT - reduction) return SHIELD_LEVEL_THREE;
  if (hitCount >= LEAD_IN_ENEMY_COUNT - reduction) return SHIELD_LEVEL_TWO;
  return SHIELD_LEVEL_ONE;
};

// The shield a character holds on the team and the level it stands at, zero without a live one. The level is a status
// Beside the shield, lasting as long as it, so a shield that breaks or runs out takes its level with it
const findShieldLevel = (effects: readonly KitEffect[], characterId: number): number => {
  if (!effects.some((effect) => checkIsKitShieldLive(effect) && effect.characterId === characterId)) return 0;
  return (
    effects.find(
      (effect): effect is KitStatus =>
        effect.kind === "status" && effect.characterId === characterId && effect.id === SHIELD_LEVEL_STATUS_ID,
    )?.stacks ?? SHIELD_LEVEL_ONE
  );
};

// Xinyan's hit that the shield's Pyro DoT strikes with, every 2 seconds from the field Rave sets, one frame after its tick
const createShieldDotHit = (talentMultiplierMap: TalentMultiplierMap): KitHit => ({
  element: Element.Pyro,
  gauge: 1,
  hitArea: SHIELD_DOT_HIT_AREA,
  hitmarkSeconds: SUMMON_HIT_SECONDS,
  poiseDamage: SHIELD_DOT_POISE_DAMAGE,
  talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 7),
});

// Sets a shield at a level, its health a flat share plus its DEF share as the table gives that level, and at level 3 starts
// The field that strikes each 2 seconds while it stands, the earlier fields of the same kind ending
const setShield = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  body: KitBody,
  level: number,
  talentMultiplierMap: TalentMultiplierMap,
): void => {
  const { characterId } = combatant;
  const shieldSeconds = getTalentMultiplier(talentMultiplierMap, XINYAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 8);
  const defenseShare = getTalentMultiplier(
    talentMultiplierMap,
    XINYAN_SKILL_GROUP_ID,
    TALENT_START_LEVEL,
    2 * level - 1,
  );
  const flatHealth = getTalentMultiplier(talentMultiplierMap, XINYAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 2 * level);
  addKitEffect(kitEffectState, {
    characterId,
    element: Element.Pyro,
    health: flatHealth + defenseShare * combatant.attributes.defense,
    kind: "shield",
    secondsRemaining: shieldSeconds,
  });
  addKitEffect(kitEffectState, {
    characterId,
    id: SHIELD_LEVEL_STATUS_ID,
    kind: "status",
    secondsRemaining: shieldSeconds,
    stacks: level,
  });
  if (level < SHIELD_LEVEL_THREE) return;
  for (const effect of kitEffectState.effects)
    if (effect.kind === "field" && effect.id === SHIELD_DOT_FIELD_ID) effect.secondsRemaining = 0;
  const centre = { x: body.position.x, z: body.position.z };
  const shieldDotHit = createShieldDotHit(talentMultiplierMap);
  const dotField: KitField = {
    centre,
    characterId,
    id: SHIELD_DOT_FIELD_ID,
    kind: "field",
    nextTickSeconds: SHIELD_DOT_INTERVAL_SECONDS,
    onTick: ({ kitEffectState: tickState }) => {
      if (findShieldLevel(tickState.effects, characterId) !== SHIELD_LEVEL_THREE) return;
      addKitEffect(tickState, {
        ...createKitSummon({ facing: 0, height: 0, position: centre }, combatant, [shieldDotHit]),
        isFollowing: true,
      });
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: shieldSeconds + FIELD_LINGER_SECONDS,
    tickIndex: 0,
    tickIntervalSeconds: SHIELD_DOT_INTERVAL_SECONDS,
  };
  addKitEffect(kitEffectState, dotField);
};

export const XINYAN_CHARACTER_ID = 10_000_044;

// Xinyan's first kit, at talent level 1: four blunt strikes, a charged attack of two hits, a collision and two plunges,
// Sweeping Fervor with its shield and Rave's DoT, and Riff Revolution with its initial hit and seven Pyro DoT hits. Her
// Multipliers are read from her proud skill groups. Ascension 1 and Constellations 2 and 4 are built. Her Ascension 4 is
// Not, as no kit event reaches the team's shield, and her Constellation 1 is not, as the kit's normal attack speed reads
// Only an infusion's, and Constellation 6 is not, as gcsim has none
export const createXinyanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitArea, hitmarkFrames, poiseDamage }: (typeof NORMAL_ATTACK_STRIKES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const plungeAction = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: 0,
        poiseDamage,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: 0.4,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const skillHit: KitHit = {
    element: Element.Pyro,
    enemyStatus: getPhysicalResistanceStatus,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    isBlunt: true,
    // Each enemy the hit strikes counts toward the shield's level, which the hit steps up as the count reaches each level
    onStrike: ({ body, combatant, kitEffectState }) => {
      const hitCount = kitEffectState.effects.find(
        (effect): effect is KitStatus =>
          effect.kind === "status" && effect.characterId === combatant.characterId && effect.id === HIT_COUNT_STATUS_ID,
      );
      if (!hitCount) return;
      hitCount.stacks = (hitCount.stacks ?? 0) + 1;
      const requiredLevel = getRequiredShieldLevel(hitCount.stacks, combatant.ascension);
      if (requiredLevel > findShieldLevel(kitEffectState.effects, combatant.characterId))
        setShield(kitEffectState, combatant, body, requiredLevel, talentMultiplierMap);
    },
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const riffInitialHit: KitHit = {
    hitArea: BURST_INITIAL_HIT_AREA,
    hitmarkSeconds: BURST_INITIAL_HITMARK_FRAMES / 60,
    poiseDamage: BURST_INITIAL_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const riffDotHit: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: BURST_DOT_HIT_AREA,
    hitmarkSeconds: 0,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: DOT_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  const riffDotHits: KitHit[] = BURST_DOT_HITMARK_FRAMES.map((frames) =>
    Object.assign({}, riffDotHit, { hitmarkSeconds: frames / 60 }),
  );
  const constellationPulseHits: KitHit[] = CONSTELLATION_PULSE_HITMARK_FRAMES.map((frames) =>
    Object.assign({}, createShieldDotHit(talentMultiplierMap), { hitmarkSeconds: frames / 60 }),
  );

  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XINYAN_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, XINYAN_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    chargedAttack: {
      hits: [4, 5].map((index) => ({
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, XINYAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    // Riff Revolution's DoT is a summon that follows the body, struck from the cast as its seven hits fall. At
    // Constellation 2 the shield is set as the burst is cast, with the Physical hit's CRIT Rate for the moment it lands
    elementalBurst: {
      hits: [riffInitialHit],
      onStart: ({ body, combatant, kitEffectState }) => {
        if (combatant.constellationCount >= CRITICAL_RATE_CONSTELLATION)
          addKitEffect(kitEffectState, {
            amount: RIFF_CRITICAL_RATE_BONUS,
            attribute: Attribute.CriticalRate,
            characterId: combatant.characterId,
            kind: "buff",
            secondsRemaining: BURST_INITIAL_HITMARK_FRAMES / 60 + FIELD_LINGER_SECONDS,
            source: RIFF_CRITICAL_RATE_SOURCE,
          });
        const hasShieldOnBurst = combatant.constellationCount >= SHIELD_ON_BURST_CONSTELLATION;
        if (hasShieldOnBurst) setShield(kitEffectState, combatant, body, SHIELD_LEVEL_THREE, talentMultiplierMap);
        const dotHits = hasShieldOnBurst ? [...riffDotHits, ...constellationPulseHits] : riffDotHits;
        addKitEffect(kitEffectState, { ...createKitSummon(body, combatant, dotHits), isFollowing: true });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [skillHit],
      // The press sets the level-1 shield when none stands, and resets the count its hit adds to
      onStart: ({ body, combatant, kitEffectState }) => {
        if (findShieldLevel(kitEffectState.effects, combatant.characterId) === 0)
          setShield(kitEffectState, combatant, body, SHIELD_LEVEL_ONE, talentMultiplierMap);
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          id: HIT_COUNT_STATUS_ID,
          kind: "status",
          secondsRemaining: SKILL_HIT_WINDOW_SECONDS,
          stacks: 0,
        });
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: plungeAction(HIGH_PLUNGE_HIT_AREA, HIGH_PLUNGE_POISE_DAMAGE, 10),
    lowPlunge: plungeAction(LOW_PLUNGE_HIT_AREA, LOW_PLUNGE_POISE_DAMAGE, 9),
    normalAttacks: NORMAL_ATTACK_STRIKES.map((strike, index) => createNormalAttack(strike, index)),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINYAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XINYAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 9),
  };
};
