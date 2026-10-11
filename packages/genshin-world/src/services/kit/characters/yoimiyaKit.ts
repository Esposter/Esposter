import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yoimiya's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4.
// The aimed shot is at 5 and the fully charged shot at 6, and the plunges' collision, low and high are at 8, 9 and 10.
// The skill group holds Niwabi Fire-Dance's duration at 1, its cooldown at 2 and the multiplier it gives her Normal
// Attacks at 3, as gcsim v2.47.2 (MIT) zz_yoimiya.dm.go labels it. The burst group holds Ryuukin Saxifrage's hit at 0,
// Aurous Blaze's explosion at 1, the explosion's internal cooldown at 2, Aurous Blaze's seconds at 3, the burst's
// Cooldown at 4 and its energy cost at 5
const YOIMIYA_ATTACK_GROUP_ID = 4931;
const YOIMIYA_SKILL_GROUP_ID = 4932;
const YOIMIYA_BURST_GROUP_ID = 4939;
const YOIMIYA_SKILL_SECONDS_INDEX = 1;
const YOIMIYA_SKILL_COOLDOWN_INDEX = 2;
const YOIMIYA_SKILL_NORMAL_ATTACK_MULTIPLIER_INDEX = 3;
const YOIMIYA_BURST_EXPLOSION_INDEX = 1;
const YOIMIYA_BURST_EXPLOSION_COOLDOWN_INDEX = 2;
const YOIMIYA_BURST_AUROUS_BLAZE_SECONDS_INDEX = 3;
const YOIMIYA_BURST_COOLDOWN_INDEX = 4;
const YOIMIYA_BURST_ENERGY_COST_INDEX = 5;

// Measured: gcsim (MIT, main) internal/characters/yoimiya/attack.go, each strike's hitmarks and the frame its action
// It cancels at the frame. Its arrows travel 10 frames to their target, which lands each hit at the hitmark plus the travel.
// Each arrow lands on the primary target through a box, priced as a circle of a metre round the body, as Ganyu's are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_STRIKES = [
  { cancelFrames: 35, hitmarkFrames: [15, 24], index: 0 },
  { cancelFrames: 26, hitmarkFrames: [17], index: 1 },
  { cancelFrames: 39, hitmarkFrames: [25], index: 2 },
  { cancelFrames: 44, hitmarkFrames: [11, 26], index: 3 },
  { cancelFrames: 52, hitmarkFrames: [17], index: 4 },
];

// Measured: gcsim (MIT, main) internal/characters/yoimiya/aimed.go. The fully charged shot's animation is 97 frames.
// Its arrow is at 86 and its travel is 10, and it has no Kindling Arrows, as the hold it is cast with gives none
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/aimed.go
const FULL_CHARGE_FRAMES = 97;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim v2.47.2 (MIT) yoimiya/skill.go and yoimiya.go, Niwabi Fire-Dance's animation of 34 frames, and for the
// Table's seconds from the cast, her Normal Attacks alone dealt as Pyro, 1U under the Normal Attack internal cooldown,
// Each multiplied by the skill's multiplier. It ends as she leaves the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yoimiya/yoimiya.go
const SKILL_FRAMES = 34;
const BLAZING_ARROW_GAUGE = 1;

// Measured: gcsim v2.47.2 (MIT) yoimiya/burst.go, Ryuukin Saxifrage's initial hit, a circle of radius 6 round the body
// At 75 frames with 220 poise and a Pyro gauge of 2U, blunt, of an animation of 113 frames. The first enemy it strikes
// Carries Aurous Blaze for the table's seconds. While it does, a hit another member deals it as a kind of attack, an
// Action's or a summon's, sets off an explosion a frame later, a circle of radius 3 round it, 1U of Pyro with 60 poise,
// Blunt, dealt as Elemental Burst DMG, gcsim's AttackTagElementalBurst, then not again on that enemy for the table's
// Internal cooldown
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yoimiya/burst.go
const BURST_FRAMES = 113;
const BURST_HITMARK_FRAMES = 75;
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
const BURST_POISE_DAMAGE = 220;
const BURST_GAUGE = 2;
const AUROUS_BLAZE_PENDING_STATUS_ID = "yoimiya-aurous-blaze-pending";
const AUROUS_BLAZE_STATUS_ID = "yoimiya-aurous-blaze";
const AUROUS_BLAZE_COOLDOWN_STATUS_ID = "yoimiya-aurous-blaze-cooldown";
const AUROUS_BLAZE_EXPLOSION_HITMARK_FRAMES = 1;
const AUROUS_BLAZE_EXPLOSION_HIT_AREA = createFanReach(360, 3);
const AUROUS_BLAZE_EXPLOSION_POISE_DAMAGE = 60;
const AUROUS_BLAZE_EXPLOSION_GAUGE = 1;

// Provisional: the plunges are the standard ones gcsim's plunge template gives, of the same reach and timing as Ganyu's, as
// Her own plunge clips are not in the sources fetched. The table's multipliers for them are read as the rest are
const PLUNGE_SECONDS = 0.4;

export const YOIMIYA_CHARACTER_ID = 10_000_049;

// Yoimiya's first kit, at talent level 1: five strikes, a fully charged shot, a collision and two plunges, Niwabi
// Fire-Dance's Blazing Arrows for the table's seconds, and Ryuukin Saxifrage's initial hit with Aurous Blaze and its
// Explosion. Her multipliers are read from her proud skill groups. Her passives and constellations are not built yet
export const createYoimiyaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hitmarkFrames, index }): KitAction => ({
    hits: hitmarkFrames.map((frames): KitHit => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (frames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // Niwabi Fire-Dance's Blazing Arrows: her strikes dealt as Pyro, each hit's multiplier raised by the skill's
  const blazingArrows: KitAction[] = normalAttacks.map((action): KitAction => ({
    ...action,
    hits: action.hits.map((hit): KitHit => ({
      ...hit,
      element: Element.Pyro,
      gauge: BLAZING_ARROW_GAUGE,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      talentMultiplier: hit.talentMultiplier * skillTalentMultiplier(YOIMIYA_SKILL_NORMAL_ATTACK_MULTIPLIER_INDEX),
    })),
  }));
  const chargedAttack: KitAction = {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(6),
      },
    ],
    isAimed: true,
    seconds: FULL_CHARGE_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };
  const chargedAttackStamina = 0;
  const burstHit: KitHit = {
    element: Element.Pyro,
    gauge: BURST_GAUGE,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(0),
  };
  // The burst readies Aurous Blaze for the first enemy its hit strikes
  const elementalBurst: KitAction = {
    hits: [burstHit],
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        id: AUROUS_BLAZE_PENDING_STATUS_ID,
        kind: "status",
        secondsRemaining: BURST_FRAMES / 60,
      }),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };
  const aurousBlazeExplosion: KitHit = {
    element: Element.Pyro,
    gauge: AUROUS_BLAZE_EXPLOSION_GAUGE,
    hitArea: AUROUS_BLAZE_EXPLOSION_HIT_AREA,
    hitmarkSeconds: AUROUS_BLAZE_EXPLOSION_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    isBlunt: true,
    poiseDamage: AUROUS_BLAZE_EXPLOSION_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(YOIMIYA_BURST_EXPLOSION_INDEX),
  };
  // Niwabi Fire-Dance is a stance for the table's seconds whose normal attacks are the Blazing Arrows
  const elementalSkill: KitAction = {
    hits: [],
    // The Blazing Arrows stay Normal Attack DMG, gcsim's AttackTagNormal in yoimiya/attack.go's Attack
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      enterKitStance(
        kitEffectState,
        combatant,
        { chargedAttack, chargedAttackStamina, elementalBurst, elementalSkill, normalAttacks: blazingArrows },
        skillTalentMultiplier(YOIMIYA_SKILL_SECONDS_INDEX),
      ),
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(YOIMIYA_BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstTalentMultiplier(YOIMIYA_BURST_ENERGY_COST_INDEX),
    chargedAttack,
    chargedAttackStamina,
    elementalBurst,
    elementalSkill,
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
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
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // Niwabi Fire-Dance ends as she leaves the field. The burst's hit marks the first enemy it strikes with Aurous Blaze,
    // And a hit another member deals a marked enemy as a kind of attack off its cooldown sets off the explosion on it
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId !== characterId) return;
        for (const effect of kitEffectState.effects)
          if (effect.kind === "stance" && effect.characterId === characterId) effect.secondsRemaining = 0;
        return;
      }

      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, striker } = event;
      if (striker.characterId === characterId) {
        if (hit !== burstHit || !checkHasKitStatus(kitEffectState.effects, characterId, AUROUS_BLAZE_PENDING_STATUS_ID))
          return;
        kitEffectState.effects = kitEffectState.effects.filter(
          (effect) =>
            !(
              effect.kind === "status" &&
              effect.characterId === characterId &&
              effect.id === AUROUS_BLAZE_PENDING_STATUS_ID
            ),
        );
        addEnemyStatus(enemy, {
          damageTakenBonus: 0,
          id: AUROUS_BLAZE_STATUS_ID,
          secondsRemaining: burstTalentMultiplier(YOIMIYA_BURST_AUROUS_BLAZE_SECONDS_INDEX),
        });
        return;
      }

      const statusIds = new Set(enemy.statuses.map(({ id }) => id));
      if (
        attackTag === undefined ||
        !statusIds.has(AUROUS_BLAZE_STATUS_ID) ||
        statusIds.has(AUROUS_BLAZE_COOLDOWN_STATUS_ID)
      )
        return;
      addEnemyStatus(enemy, {
        damageTakenBonus: 0,
        id: AUROUS_BLAZE_COOLDOWN_STATUS_ID,
        secondsRemaining: burstTalentMultiplier(YOIMIYA_BURST_EXPLOSION_COOLDOWN_INDEX),
      });
      addKitEffect(kitEffectState, {
        ...createKitSummon({ facing: 0, height: 0, position: enemy.position }, combatant, [aurousBlazeExplosion]),
        attackTag: AttackTag.ElementalBurst,
      });
    },
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(YOIMIYA_SKILL_COOLDOWN_INDEX),
  };
};
