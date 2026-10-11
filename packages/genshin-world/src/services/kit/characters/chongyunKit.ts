import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { MELEE_WEAPON_TYPES } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Chongyun's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's cyclic and final slashes at 4 and 5 and its stamina a second at 6, and the plunges' collision, low and high at
// 8, 9 and 10. The skill group holds Layered Frost's damage at 0, the infusion's seconds at 1, its cooldown at 2 and its
// Field's seconds at 3. The burst group holds Cloud-Parting Star's damage at 0, its cooldown at 1 and its energy cost at 2
const CHONGYUN_ATTACK_GROUP_ID = 3631;
const CHONGYUN_SKILL_GROUP_ID = 3632;
const CHONGYUN_BURST_GROUP_ID = 3639;

// Measured: gcsim v2.47.2 (MIT) chongyun/attack.go, each strike's circle or box as priced from the body: a circle is its
// Offset plus its radius, a fan keeps its angle, and a box spawns on its near edge, so it is priced as the circle to its far
// Corner. The fourth strike's box is 2 wide and 3 long from half a metre behind
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: (3 * Math.PI) / 2, height: 2, radius: 1 + 2 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(2.5, 2 / 2),
});
// Measured: gcsim v2.47.2 (MIT) chongyun/config.yml, the charged attack's spinning circle of radius 3 a third of a metre
// Ahead and its final circle of radius 3.5, both marked not yet implemented there
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/config.yml
const CHARGED_CYCLIC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 3 });
const CHARGED_FINAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) chongyun/plunge.go, the collision's circle of radius 1 a metre ahead, and the low and high
// Plunges' of 3 and 5 a metre ahead, each priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Measured: gcsim v2.47.2 (MIT) chongyun/skill.go, Layered Frost's circle of radius 2.5 centred 1.5 metres ahead, priced
// As its offset plus its radius, and the field it leaves, a circle of radius 8 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/skill.go
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 + 2.5 });
const FIELD_RADIUS = 8;
const FIELD_OFFSET_METRES = 1.5;
// Provisional: gcsim v2.47.2 (MIT) chongyun/burst.go drops each blade as a circle of radius 3.5 on the primary target, which
// An area does not hold, so a blade reaches the 5 metres an attack targets within, as Xingqiu's sword rain does
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) chongyun/attack.go, each strike's hitmark, animation and poise at 60 fps. Each strike is
// Blunt, and each is physical
const CHONGYUN_STRIKES = [
  { animationFrames: 30, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 26, index: 0, poiseDamage: 105 },
  { animationFrames: 36, hitArea: SECOND_STRIKE_HIT_AREA, hitmarkFrames: 24, index: 1, poiseDamage: 95 },
  { animationFrames: 57, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 41, index: 2, poiseDamage: 121 },
  { animationFrames: 101, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 53, index: 3, poiseDamage: 152 },
];

// Measured: gcsim v2.47.2 (MIT) chongyun/skill.go, Layered Frost's hit at 36 frames, its animation's 52, and the field
// Ticking each second from the hit, which infuses the active character with Cryo while it stands in the field
const SKILL_ANIMATION_FRAMES = 52;
const SKILL_HITMARK_FRAMES = 36;
const SKILL_HIT_POISE_DAMAGE = 150;
const FIELD_TICK_SECONDS = 1;
// The field lasts from its hit for its seconds, which the table gives as 10, and a tenth of a second past its last tick
const FIELD_TICK_MARGIN_SECONDS = 0.1;

// Measured: gcsim v2.47.2 (MIT) chongyun/burst.go, the three blades at 50, 59 and 67 frames and the animation's 79. Each
// Blade's poise is 100, as gcsim gives it
const BURST_ANIMATION_FRAMES = 79;
const BURST_HITMARK_FRAMES = [50, 59, 67];
const BURST_POISE_DAMAGE = 100;

// Steady Breathing, from Ascension 1: a sword, claymore or polearm wielder the field infuses has its Normal ATK SPD
// Raised by 8% for as long as the infusion holds, as gcsim v2.47.2 (MIT) chongyun/skill.go gives it with the infusion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/skill.go
const STEADY_BREATHING_ASCENSION = 1;
const STEADY_BREATHING_NORMAL_ATTACK_SPEED_BONUS = 0.08;
// Rimechaser Blade, from Ascension 4: as the field disappears a blade strikes the enemy nearest its centre within it, or
// Its centre, for 100% of Layered Frost's damage, cutting the Cryo RES of the enemies it hits by 10% for 8 seconds.
// Measured: gcsim v2.47.2 (MIT) chongyun/asc.go, the blade's circle of radius 3.5 striking 655 frames after the press,
// And the wiki's 1U, blunt, with 100 poise and no internal cooldown
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/asc.go
// https://genshin-impact.fandom.com/wiki/Rimechaser_Blade
const RIMECHASER_BLADE_ASCENSION = 4;
const RIMECHASER_BLADE_FRAMES = 655;
const RIMECHASER_BLADE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
const RIMECHASER_BLADE_POISE_DAMAGE = 100;
const RIMECHASER_BLADE_STATUS_ID = "chongyun-rimechaser-blade";
const RIMECHASER_BLADE_CRYO_RESISTANCE_REDUCTION = 0.1;
const RIMECHASER_BLADE_STATUS_SECONDS = 8;
// Ice Unleashed, from one constellation: the fourth strike releases 3 ice blades, each 50% of Chongyun's ATK as Cryo,
// Five frames apart. Measured: gcsim v2.47.2 (MIT) chongyun/attack.go, and the wiki's 1U and 36 poise with no internal
// Cooldown. Provisional: gcsim's blades strike a circle of radius 1 that an area does not hold, so each reaches what the
// Fourth strike reaches. https://genshin-impact.fandom.com/wiki/Ice_Unleashed
const ICE_UNLEASHED_CONSTELLATION = 1;
const ICE_UNLEASHED_BLADE_COUNT = 3;
const ICE_UNLEASHED_INTERVAL_FRAMES = 5;
const ICE_UNLEASHED_POISE_DAMAGE = 36;
const ICE_UNLEASHED_TALENT_MULTIPLIER = 0.5;
// Atmospheric Revolution, from two constellations: a skill or burst cast inside the field has its cooldown cut by 15%
const ATMOSPHERIC_REVOLUTION_CONSTELLATION = 2;
const ATMOSPHERIC_REVOLUTION_COOLDOWN_MULTIPLIER = 0.85;
// Frozen Skies, from four constellations: Chongyun's hits on an enemy with Cryo on it while he is on the field give him
// 1 energy, at most once every 2 seconds, as the game's text gives it where gcsim gives 2
// https://genshin-impact.fandom.com/wiki/Frozen_Skies
const FROZEN_SKIES_CONSTELLATION = 4;
const FROZEN_SKIES_ENERGY = 1;
const FROZEN_SKIES_COOLDOWN_STATUS_ID = "chongyun-frozen-skies-cooldown";
const FROZEN_SKIES_COOLDOWN_SECONDS = 2;
// Rally of Four Blades, from six constellations: Cloud-Parting Star deals 15% more DMG to an enemy with a lower share of
// Its Max HP left than Chongyun, and calls a fourth blade at 77 frames, measured: gcsim v2.47.2 (MIT) chongyun/burst.go
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/burst.go
const RALLY_OF_FOUR_BLADES_CONSTELLATION = 6;
const RALLY_OF_FOUR_BLADES_DAMAGE_BONUS = 0.15;
const RALLY_OF_FOUR_BLADES_HITMARK_FRAMES = 77;

const FROST_FIELD_ID = "chongyun-frost-field";

// Whether an effect is Layered Frost's field
const checkIsFrostField = (effect: KitEffect): effect is KitField =>
  effect.kind === "field" && effect.id === FROST_FIELD_ID;

// Provisional: gcsim has the charged attack's spinning and final slashes marked not yet implemented, so they land at half a
// Second and a second, as Beidou's and Razor's do, and the charged attack ends at a second and a fifth. The wiki's
// Advanced properties give the cyclic slash 60 poise and the final 120, both blunt
const CHARGED_CYCLIC_HITMARK_SECONDS = 0.5;
const CHARGED_FINAL_HITMARK_SECONDS = 1;
const CHARGED_ATTACK_SECONDS = 1.2;
const CHARGED_CYCLIC_POISE_DAMAGE = 60;
const CHARGED_FINAL_POISE_DAMAGE = 120;

// Measured: gcsim v2.47.2 (MIT) chongyun/plunge.go, the low plunge's hitmark at 47 frames and animation's 85, the high's 47
// And 87. The wiki's advanced properties give the low and high plunges 150 and 200 poise, as gcsim gives them, and the
// Collision 35, which gcsim gives none
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_ANIMATION_FRAMES = 85;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_ANIMATION_FRAMES = 87;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;
const PLUNGE_COLLISION_POISE_DAMAGE = 35;

// Chongyun's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Spirit Blade:
// Chonghua's Layered Frost with its field that infuses the active character, and the character a swap brings on while it
// Stands, a press replacing the field standing, and Spirit Blade: Cloud-Parting Star. Rimechaser Blade, Ice Unleashed
// And Frozen Skies answer the kit's events. Its multipliers are read from his proud skill groups. The charged attack's
// Stamina is drained a second for as long as it plays, as Beidou's is
export const createChongyunKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // A claymore's strikes are physical and blunt under the Normal Attack internal cooldown
  const normalAttacks: KitAction[] = CHONGYUN_STRIKES.map(
    ({ animationFrames, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: animationFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  // Layered Frost's field infuses the active character with Cryo each second while it stands in the field, a sword,
  // Claymore or polearm wielder alone, for the infusion's seconds, and its hit lands at its hitmark with 2U of Cryo and
  // 150 poise
  const infusionSeconds = skillTalentMultiplier(1);
  const skillHit: KitHit = {
    element: Element.Cryo,
    gauge: 2,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: SKILL_HIT_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };
  const fieldSeconds = skillTalentMultiplier(3) + SKILL_HITMARK_FRAMES / 60 + FIELD_TICK_MARGIN_SECONDS;
  const rimechaserBladeHit: KitHit = {
    element: Element.Cryo,
    enemyStatus: () => ({
      damageTakenBonus: 0,
      id: RIMECHASER_BLADE_STATUS_ID,
      resistanceReduction: { [Element.Cryo]: RIMECHASER_BLADE_CRYO_RESISTANCE_REDUCTION },
      secondsRemaining: RIMECHASER_BLADE_STATUS_SECONDS,
    }),
    gauge: 1,
    hitArea: RIMECHASER_BLADE_HIT_AREA,
    hitmarkSeconds: Math.max(1 / 60, RIMECHASER_BLADE_FRAMES / 60 - fieldSeconds),
    isBlunt: true,
    poiseDamage: RIMECHASER_BLADE_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };
  const iceUnleashedHits: KitHit[] = Array.from({ length: ICE_UNLEASHED_BLADE_COUNT }, (_blade, index) => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: FOURTH_STRIKE_HIT_AREA,
    hitmarkSeconds: (index * ICE_UNLEASHED_INTERVAL_FRAMES + 1) / 60,
    poiseDamage: ICE_UNLEASHED_POISE_DAMAGE,
    talentMultiplier: ICE_UNLEASHED_TALENT_MULTIPLIER,
  }));
  // Cloud-Parting Star's blades, each 1U of Cryo with no internal cooldown: three from the cast, and a fourth from six
  // Constellations
  const createBurstBlade = (hitmarkFrames: number): KitHit => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(0),
  });
  const burstBladeHits = BURST_HITMARK_FRAMES.map((hitmarkFrames) => createBurstBlade(hitmarkFrames));
  const rallyOfFourBladesHit = createBurstBlade(RALLY_OF_FOUR_BLADES_HITMARK_FRAMES);
  // The field's infusion on a character, with Steady Breathing's Normal ATK SPD from Ascension 1
  const infuse = (
    kitEffectState: KitEffectState,
    { ascension }: Combatant,
    { characterId, weaponType }: Combatant,
  ): void => {
    if (weaponType === undefined || !MELEE_WEAPON_TYPES.has(weaponType)) return;
    addKitEffect(kitEffectState, {
      characterId,
      element: Element.Cryo,
      kind: "infusion",
      ...(ascension >= STEADY_BREATHING_ASCENSION && {
        normalAttackSpeedBonus: STEADY_BREATHING_NORMAL_ATTACK_SPEED_BONUS,
      }),
      secondsRemaining: infusionSeconds,
    });
  };
  return {
    burstCooldownSeconds: burstTalentMultiplier(1),
    burstEnergyCost: burstTalentMultiplier(2),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_CYCLIC_HIT_AREA,
          hitmarkSeconds: CHARGED_CYCLIC_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: CHARGED_CYCLIC_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(4),
        },
        {
          hitArea: CHARGED_FINAL_HIT_AREA,
          hitmarkSeconds: CHARGED_FINAL_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: CHARGED_FINAL_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(5),
        },
      ],
      seconds: CHARGED_ATTACK_SECONDS,
      staminaPerSecond: attackTalentMultiplier(6),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: burstBladeHits,
      onStart: ({ body, combatant, kitEffectState }) => {
        if (combatant.constellationCount >= RALLY_OF_FOUR_BLADES_CONSTELLATION)
          addKitEffect(kitEffectState, createKitSummon(body, combatant, [rallyOfFourBladesHit]));
      },
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [skillHit],
      onStart: ({ body, combatant, kitEffectState }) => {
        // A press ends the field standing, which disappears on the next step, and places its own as the press's hit is, a
        // Metre and a half ahead of the body
        for (const effect of kitEffectState.effects) if (checkIsFrostField(effect)) effect.secondsRemaining = 0;
        addKitEffect(kitEffectState, {
          centre: {
            x: body.position.x - Math.sin(body.facing) * FIELD_OFFSET_METRES,
            z: body.position.z - Math.cos(body.facing) * FIELD_OFFSET_METRES,
          },
          characterId: combatant.characterId,
          ...(combatant.constellationCount >= ATMOSPHERIC_REVOLUTION_CONSTELLATION && {
            cooldownMultiplier: ATMOSPHERIC_REVOLUTION_COOLDOWN_MULTIPLIER,
          }),
          id: FROST_FIELD_ID,
          kind: "field",
          nextTickSeconds: SKILL_HITMARK_FRAMES / 60,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }) =>
            infuse(tickEffectState, combatant, activeCombatant),
          radius: FIELD_RADIUS,
          secondsRemaining: fieldSeconds,
          tickIndex: 0,
          tickIntervalSeconds: FIELD_TICK_SECONDS,
        });
      },
      seconds: SKILL_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getStrikeDamageBonus: ({ combatant, hit }, enemy, party) =>
      combatant.constellationCount >= RALLY_OF_FOUR_BLADES_CONSTELLATION &&
      (burstBladeHits.includes(hit) || hit === rallyOfFourBladesHit) &&
      enemy.health / enemy.maxHealth < getPartyMember(party, combatant.characterId).healthShare
        ? RALLY_OF_FOUR_BLADES_DAMAGE_BONUS
        : 0,
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // A swap brings the field's infusion on whoever comes on while it stands, its end strikes Rimechaser Blade from
    // Ascension 4, and the fourth strike's ice blades and the energy on a Cryo enemy come from one and four constellations
    onKitEvent: (event, { activeCombatant, body, combatant, enemyMap, kitEffectState, party }) => {
      const { ascension, characterId, constellationCount } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (kitEffectState.effects.some((effect) => checkIsFrostField(effect)))
          infuse(kitEffectState, combatant, activeCombatant);
      } else if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (!checkIsFrostField(effect) || effect.characterId !== characterId || ascension < RIMECHASER_BLADE_ASCENSION)
          return;
        const { centre, radius } = effect;
        const enemy = selectAttackTarget(
          { angle: 2 * Math.PI, height: Number.POSITIVE_INFINITY, radius },
          { facing: 0, height: 0, position: centre },
          enemyMap.values(),
        );
        addKitEffect(
          kitEffectState,
          createKitSummon({ facing: 0, height: 0, position: enemy?.position ?? centre }, combatant, [
            rimechaserBladeHit,
          ]),
        );
      } else if (event.kind === KitEventKind.NormalAttackLanded) {
        if (
          activeCombatant.characterId === characterId &&
          constellationCount >= ICE_UNLEASHED_CONSTELLATION &&
          event.action === normalAttacks.at(-1)
        )
          addKitEffect(kitEffectState, createKitSummon(body, combatant, iceUnleashedHits));
      } else if (event.kind === KitEventKind.DamageTaken) {
        if (
          constellationCount < FROZEN_SKIES_CONSTELLATION ||
          event.striker.characterId !== characterId ||
          activeCombatant.characterId !== characterId ||
          !event.enemy.elementalState.auras.has(AuraType.Cryo) ||
          checkHasKitStatus(kitEffectState.effects, characterId, FROZEN_SKIES_COOLDOWN_STATUS_ID)
        )
          return;
        gainPartyMemberEnergy(party, combatant, FROZEN_SKIES_ENERGY);
        addKitEffect(kitEffectState, {
          characterId,
          id: FROZEN_SKIES_COOLDOWN_STATUS_ID,
          kind: "status",
          secondsRemaining: FROZEN_SKIES_COOLDOWN_SECONDS,
        });
      }
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(2),
  };
};
