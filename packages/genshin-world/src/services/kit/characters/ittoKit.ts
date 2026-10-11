import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Itto's proud skill groups, read at his talent level, as the game's tables give them and as gcsim v2.47.2 (MIT) labels
// Them in zz_aratakiitto.dm.go. The attack group holds the four strikes at 0 to 3, the Saichimonji Slash at 4, the
// Arataki Kesagiri combo's and final slashes at 5 and 6, the plunges' collision at 8, and the low and high plunges at 9
// And 10. The skill group holds Masatsu Zetsugi's damage at 0, the share of Itto's Max HP Ushi inherits at 1, its
// Seconds at 2 and the skill's cooldown at 4. The burst group holds the ATK bonus per DEF at 1, its cooldown at 4 and
// Its energy cost at 5
const ITTO_ATTACK_GROUP_ID = 5731;
const ITTO_SKILL_GROUP_ID = 5732;
const ITTO_BURST_GROUP_ID = 5739;
const ITTO_USHI_HEALTH_SHARE_INDEX = 1;
const ITTO_USHI_SECONDS_INDEX = 2;
const ITTO_SKILL_COOLDOWN_INDEX = 4;
const ITTO_BURST_DEFENSE_BONUS_INDEX = 1;
const ITTO_BURST_COOLDOWN_INDEX = 4;
const ITTO_BURST_ENERGY_COST_INDEX = 5;

// Measured: gcsim v2.47.2 (MIT) itto/attack.go, each strike's hitmark, its cancel to a charged attack and its circle or box,
// Priced from the body as the other kits' are: a circle as its offset plus its radius, and the box to its far corner. Its
// Poise is gcsim's too. Under the burst the strikes reach further, which the converted reaches below give
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/attack.go
const NORMAL_ATTACK_STRIKES = [
  {
    cancelFrames: 41,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.8 + 2.5),
    hitmarkFrames: 23,
    index: 0,
    poiseDamage: 82.9,
  },
  {
    cancelFrames: 51,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.8 + 2.5),
    hitmarkFrames: 25,
    index: 1,
    poiseDamage: 77.9,
  },
  {
    cancelFrames: 57,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.85 + 2.5),
    hitmarkFrames: 16,
    index: 2,
    poiseDamage: 98.3,
  },
  {
    cancelFrames: 83,
    convertedHitArea: createBoxReach(-1.7, 3.8, 8),
    hitArea: createBoxReach(-1.5, 3.2, 6),
    hitmarkFrames: 48,
    index: 3,
    poiseDamage: 124.5,
  },
];

// Measured: gcsim v2.47.2 (MIT) itto/charge.go, the Saichimonji Slash, the charged attack with no Superlative Superstrength,
// As a circle of radius 3 round the body at 89 frames, its animation 131, and 120 poise. Under the burst it is a circle
// Of 4. Every charged slash of his, as gcsim tags it, shares the Normal Attack internal cooldown
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/charge.go
const SAICHIMONJI_HITMARK_FRAMES = 89;
const SAICHIMONJI_FRAMES = 131;
const SAICHIMONJI_HIT_AREA = createFanReach(360, 3);
const SAICHIMONJI_CONVERTED_HIT_AREA = createFanReach(360, 4);
const SAICHIMONJI_POISE_DAMAGE = 120;
// Measured: gcsim v2.47.2 (MIT) itto/charge.go, the charged attack's stamina as ActionStam gives it, 20 with no stacks, which
// The attack group's index 7 gives too, and none while he holds Superlative Superstrength
const CHARGED_ATTACK_STAMINA_INDEX = 7;
const ARATAKI_KESAGIRI_STAMINA = 0;

// Measured: gcsim v2.47.2 (MIT) itto/charge.go, the Arataki Kesagiri a charged attack plays while Itto holds
// Superlative Superstrength, one slash a stack: combo slashes from the left and the right in turn, and the final slash
// On the last stack. A left slash lands at 51 frames and a right at 24, each a box of 3.8 by 5.5 set 2 metres back, and
// The final at 71 of 109, a circle of 3.5 set 0.6 ahead. A chained slash skips its windup, 28 frames for a left after a
// Right and 25 for the final after either, and the next slash starts 57 frames into a left and 29 into a right, or 60
// And 32 when the next is the final. Under the burst a combo slash is a box of 5 by 7 set 2.5 back and the final a
// Circle of 4.3 set 0.8 ahead. The first slash of a combo and the final deal 143.4 poise and the others 81.7
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/charge.go
const LEFT_SLASH_HITMARK_FRAMES = 51;
const RIGHT_SLASH_HITMARK_FRAMES = 24;
const FINAL_SLASH_HITMARK_FRAMES = 71;
const FINAL_SLASH_FRAMES = 109;
const LEFT_TO_RIGHT_SLASH_FRAMES = 57;
const RIGHT_TO_LEFT_SLASH_FRAMES = 29;
const LEFT_TO_FINAL_SLASH_FRAMES = 60;
const RIGHT_TO_FINAL_SLASH_FRAMES = 32;
const RIGHT_TO_LEFT_WINDUP_FRAMES = 28;
const COMBO_TO_FINAL_WINDUP_FRAMES = 25;
const COMBO_SLASH_HIT_AREA = createBoxReach(-2, 3.8, 5.5);
const COMBO_SLASH_CONVERTED_HIT_AREA = createBoxReach(-2.5, 5, 7);
const FINAL_SLASH_HIT_AREA = createFanReach(360, 0.6 + 3.5);
const FINAL_SLASH_CONVERTED_HIT_AREA = createFanReach(360, 0.8 + 4.3);
const OPENING_SLASH_POISE_DAMAGE = 143.4;
const COMBO_SLASH_POISE_DAMAGE = 81.7;
const FINAL_SLASH_POISE_DAMAGE = 143.4;

// Measured: gcsim v2.47.2 (MIT) itto/itto.go and attack.go, Superlative Superstrength's cap of 5 stacks, held until a
// Slash spends them, and the stacks a normal attack gives as it lands, as gcsim assumes it hits: 1 for the second
// Strike and 2 for the fourth, and under the burst 1 more for the first and the third
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/attack.go
const SUPERSTRENGTH_STATUS_ID = "itto-superlative-superstrength";
const SUPERSTRENGTH_MAX_STACKS = 5;
const NORMAL_ATTACK_SUPERSTRENGTH_STACKS = [0, 1, 0, 2];
const RAGING_ONI_KING_SUPERSTRENGTH_STACKS = [1, 0, 1, 0];

// Measured: gcsim v2.47.2 (MIT) itto/plunge.go, the collision at 31 frames as a circle of radius 1 round the body, and the
// Low and high plunges at 37 and 40 frames, circles of radius 3 and 5 with their animations of 83 and 87 frames, and 4 and 6
// Under the burst. gcsim gives the collision no poise and the plunges 150 and 200
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/plunge.go
const COLLISION_HITMARK_FRAMES = 31;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_FRAMES = 83;
const HIGH_PLUNGE_HITMARK_FRAMES = 40;
const HIGH_PLUNGE_FRAMES = 87;
const COLLISION_POISE_DAMAGE = 0;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Measured: gcsim v2.47.2 (MIT) itto/skill.go and ushi.go, Masatsu Zetsugi: Akaushi Burst's hit at 14 frames, a
// Circle of radius 3.5 on the primary target, with its animation of 42 frames, 250 poise and a gauge of 1U, blunt. It
// Throws Ushi onto the primary target, one at a time, which gives a stack of Superlative Superstrength the first time
// Its hit strikes, one as it takes an enemy's strike, at most once every 2 seconds, and another as it leaves, its seconds
// Run out or its health spent. Ushi flees as it leaves and deals no damage, so the taunt carries no explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/skill.go
const SKILL_HITMARK_FRAMES = 14;
const SKILL_FRAMES = 42;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 3.5);
const SKILL_POISE_DAMAGE = 250;
const SKILL_GAUGE = 1;
const USHI_STRUCK_STATUS_ID = "itto-ushi-struck";
const USHI_DAMAGED_COOLDOWN_STATUS_ID = "itto-ushi-damaged-cooldown";
const USHI_DAMAGED_COOLDOWN_SECONDS = 2;

// Measured: gcsim v2.47.2 (MIT) itto/burst.go, Royal Descent's animation of 91 frames, its ATK bonus per DEF, its 0.1 Normal
// ATK SPD and its Geo conversion, all for 795 frames: gcsim's 660, 90 and 45, which barely cover the basic combo
const BURST_FRAMES = 91;
const BURST_SECONDS = (660 + 90 + 45) / 60;
const BURST_NORMAL_ATTACK_SPEED_BONUS = 0.1;

// The stacks of Superlative Superstrength Itto holds
const countSuperstrength = (effects: readonly KitEffect[], characterId: number): number =>
  effects.find(
    (effect): effect is KitStatus =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === SUPERSTRENGTH_STATUS_ID,
  )?.stacks ?? 0;

// Whether Itto is the Raging Oni King: his burst's Geo conversion is on him
const checkIsRagingOniKing = (effects: readonly KitEffect[], characterId: number): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "infusion" &&
      effect.characterId === characterId &&
      effect.element === Element.Geo &&
      effect.isConverted === true,
  );

export const ITTO_CHARACTER_ID = 10_000_057;

// Itto's first kit, at talent level 1: four strikes, the Saichimonji Slash, a collision and two plunges, Masatsu
// Zetsugi's hit with Ushi, and Royal Descent's Geo conversion with its ATK bonus per DEF and Normal ATK SPD. His
// Multipliers are read from his proud skill groups. His normal attacks and Ushi give him Superlative Superstrength,
// Whose stacks turn his charged attack into the Arataki Kesagiri. His passives and constellations are not built
export const createIttoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Each strike is one hit at its hitmark, a blunt slash priced under the Normal Attack internal cooldown
  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(
    ({ cancelFrames, convertedHitArea, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: [
        {
          convertedHitArea,
          convertedPoiseDamage: poiseDamage,
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const saichimonjiAttack: KitAction = {
    hits: [
      {
        convertedHitArea: SAICHIMONJI_CONVERTED_HIT_AREA,
        convertedPoiseDamage: SAICHIMONJI_POISE_DAMAGE,
        hitArea: SAICHIMONJI_HIT_AREA,
        hitmarkSeconds: SAICHIMONJI_HITMARK_FRAMES / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage: SAICHIMONJI_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(4),
      },
    ],
    seconds: SAICHIMONJI_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const skillHit: KitHit = {
    element: Element.Geo,
    gauge: SKILL_GAUGE,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    isBlunt: true,
    // Ushi's hit gives a stack the first time it strikes, however many enemies it strikes
    onStrike: ({ kitEffectState }, { combatant }) => {
      const { characterId } = combatant;
      if (checkHasKitStatus(kitEffectState.effects, characterId, USHI_STRUCK_STATUS_ID)) return;
      addKitEffect(kitEffectState, {
        characterId,
        id: USHI_STRUCK_STATUS_ID,
        kind: "status",
        secondsRemaining: SKILL_FRAMES / 60,
      });
      gainSuperstrength(kitEffectState, combatant, 1);
    },
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };
  // Masatsu Zetsugi throws Ushi onto the enemy it turned to, or where Itto stands without one, a taunt holding his Max
  // HP's share for its seconds from the hit. A second Ushi sends the first away
  const elementalSkill: KitAction = {
    hits: [skillHit],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }, target) => {
      for (const effect of kitEffectState.effects)
        if (effect.kind === "taunt" && effect.combatant.characterId === combatant.characterId)
          effect.secondsRemaining = 0;
      const { x, z } = target?.position ?? body.position;
      addKitEffect(kitEffectState, {
        body: { facing: body.facing, height: body.height, position: { x, z } },
        combatant,
        health: skillTalentMultiplier(ITTO_USHI_HEALTH_SHARE_INDEX) * combatant.attributes.maxHealth,
        kind: "taunt",
        secondsRemaining: SKILL_HITMARK_FRAMES / 60 + skillTalentMultiplier(ITTO_USHI_SECONDS_INDEX),
      });
    },
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };
  // Royal Descent deals no damage. It adds Itto's ATK per DEF to his attacks, and infuses them with Geo as they are
  // Converted, with the burst's Normal ATK SPD, for its seconds from the cast
  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: burstTalentMultiplier(ITTO_BURST_DEFENSE_BONUS_INDEX) * combatant.attributes.defense,
        attribute: Attribute.Attack,
        secondsRemaining: BURST_SECONDS,
      });
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        normalAttackSpeedBonus: BURST_NORMAL_ATTACK_SPEED_BONUS,
        secondsRemaining: BURST_SECONDS,
      });
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // A slash of the Arataki Kesagiri at its hitmark, the first of a combo's poise higher than the rest
  const createSlash = (hitmarkFrames: number, isFinal: boolean, isOpening: boolean): KitHit => {
    const poiseDamage = isFinal
      ? FINAL_SLASH_POISE_DAMAGE
      : isOpening
        ? OPENING_SLASH_POISE_DAMAGE
        : COMBO_SLASH_POISE_DAMAGE;
    return {
      convertedHitArea: isFinal ? FINAL_SLASH_CONVERTED_HIT_AREA : COMBO_SLASH_CONVERTED_HIT_AREA,
      convertedPoiseDamage: poiseDamage,
      hitArea: isFinal ? FINAL_SLASH_HIT_AREA : COMBO_SLASH_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage,
      talentMultiplier: attackTalentMultiplier(isFinal ? 6 : 5),
    };
  };
  // The Arataki Kesagiri a charged attack plays at a count of stacks, held through every one: the combo slashes from
  // The left and the right in turn, each skipping the windup its chain gives it, then the final. It spends the stacks
  // As it starts, and its stance lasts as long as it plays, so its slashes stay its charged attack's to the last
  const createKesagiri = (stacks: number): KitAction => {
    const hits: KitHit[] = [];
    let startFrames = 0;
    for (let index = 0; index < stacks - 1; index++) {
      const isLeft = index % 2 === 0;
      const windupFrames = isLeft && index > 0 ? RIGHT_TO_LEFT_WINDUP_FRAMES : 0;
      const hitmarkFrames = isLeft ? LEFT_SLASH_HITMARK_FRAMES : RIGHT_SLASH_HITMARK_FRAMES;
      hits.push(createSlash(startFrames + hitmarkFrames - windupFrames, false, index === 0));
      const isNextFinal = index === stacks - 2;
      const nextFrames = isLeft
        ? isNextFinal
          ? LEFT_TO_FINAL_SLASH_FRAMES
          : LEFT_TO_RIGHT_SLASH_FRAMES
        : isNextFinal
          ? RIGHT_TO_FINAL_SLASH_FRAMES
          : RIGHT_TO_LEFT_SLASH_FRAMES;
      startFrames += nextFrames - windupFrames;
    }
    const finalWindupFrames = stacks > 1 ? COMBO_TO_FINAL_WINDUP_FRAMES : 0;
    hits.push(createSlash(startFrames + FINAL_SLASH_HITMARK_FRAMES - finalWindupFrames, true, false));
    const seconds = (startFrames + FINAL_SLASH_FRAMES - finalWindupFrames) / 60;
    return {
      hits,
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const stance = findKitStance(kitEffectState.effects, combatant.characterId);
        if (stance) stance.secondsRemaining = seconds;
        kitEffectState.effects = kitEffectState.effects.filter(
          (effect) =>
            !(
              effect.kind === "status" &&
              effect.characterId === combatant.characterId &&
              effect.id === SUPERSTRENGTH_STATUS_ID
            ),
        );
      },
      seconds,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  };
  const kesagiris = Array.from({ length: SUPERSTRENGTH_MAX_STACKS }, (_value, index) => createKesagiri(index + 1));
  // Itto's stance while he holds stacks, whose charged attack is the Arataki Kesagiri for them at no stamina, held
  // Until a charged attack starts it. The Arataki Kesagiri slashes are Charged Attack DMG, gcsim's AttackTagExtra in
  // Itto/charge.go's ChargeAttack
  const addKesagiriStance = (kitEffectState: KitEffectState, combatant: Combatant, stacks: number): void =>
    enterKitStance(
      kitEffectState,
      combatant,
      {
        chargedAttack: kesagiris[stacks - 1] ?? saichimonjiAttack,
        chargedAttackStamina: ARATAKI_KESAGIRI_STAMINA,
        elementalBurst,
        elementalSkill,
        normalAttacks,
      },
      Number.POSITIVE_INFINITY,
    );
  // Adds stacks of Superlative Superstrength, up to 5, and readies the Arataki Kesagiri for them, unless one is
  // Playing, whose end readies it
  const gainSuperstrength = (kitEffectState: KitEffectState, combatant: Combatant, gained: number): void => {
    if (gained === 0) return;
    const { characterId } = combatant;
    const stacks = Math.min(countSuperstrength(kitEffectState.effects, characterId) + gained, SUPERSTRENGTH_MAX_STACKS);
    addKitEffect(kitEffectState, {
      characterId,
      id: SUPERSTRENGTH_STATUS_ID,
      kind: "status",
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks,
    });
    const stance = findKitStance(kitEffectState.effects, characterId);
    if (stance === undefined || stance.secondsRemaining === Number.POSITIVE_INFINITY)
      addKesagiriStance(kitEffectState, combatant, stacks);
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(ITTO_BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstTalentMultiplier(ITTO_BURST_ENERGY_COST_INDEX),
    chargedAttack: saichimonjiAttack,
    chargedAttackStamina: attackTalentMultiplier(CHARGED_ATTACK_STAMINA_INDEX),
    elementalBurst,
    elementalSkill,
    highPlunge: {
      hits: [
        {
          convertedHitArea: createFanReach(360, 6),
          convertedPoiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          convertedHitArea: createFanReach(360, 4),
          convertedPoiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // A normal attack of his gives him its stacks as it lands, more as the Raging Oni King, and Ushi one as it takes an
    // Enemy's strike, off its cooldown, and one as it leaves. An Arataki Kesagiri that ends with stacks gained while it
    // Played readies the next
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.TauntDamaged) {
        if (
          event.taunt.combatant.characterId !== characterId ||
          checkHasKitStatus(kitEffectState.effects, characterId, USHI_DAMAGED_COOLDOWN_STATUS_ID)
        )
          return;
        addKitEffect(kitEffectState, {
          characterId,
          id: USHI_DAMAGED_COOLDOWN_STATUS_ID,
          kind: "status",
          secondsRemaining: USHI_DAMAGED_COOLDOWN_SECONDS,
        });
        gainSuperstrength(kitEffectState, combatant, 1);
        return;
      }

      if (event.kind === KitEventKind.NormalAttackLanded) {
        const index = normalAttacks.indexOf(event.action);
        if (index === -1) return;
        const ragingOniKingStacks = checkIsRagingOniKing(kitEffectState.effects, characterId)
          ? (RAGING_ONI_KING_SUPERSTRENGTH_STACKS[index] ?? 0)
          : 0;
        gainSuperstrength(
          kitEffectState,
          combatant,
          (NORMAL_ATTACK_SUPERSTRENGTH_STACKS[index] ?? 0) + ragingOniKingStacks,
        );
        return;
      }

      if (event.kind !== KitEventKind.EffectExpired) return;
      const { effect } = event;
      if (effect.kind === "taunt" && effect.combatant.characterId === characterId)
        gainSuperstrength(kitEffectState, combatant, 1);
      else if (effect.kind === "stance" && effect.characterId === characterId) {
        const stacks = countSuperstrength(kitEffectState.effects, characterId);
        if (stacks > 0) addKesagiriStance(kitEffectState, combatant, stacks);
      }
    },
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(ITTO_SKILL_COOLDOWN_INDEX),
  };
};
