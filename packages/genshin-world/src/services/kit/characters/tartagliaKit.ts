import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Tartaglia's proud skill groups, read at his talent level. The attack group holds the six arrows at 0 to 5, the aimed
// Shot at 6 and the fully charged aimed shot at 7, Riptide Flash at 8 and Riptide Burst at 9, the plunges' collision, low
// And high at 10, 11 and 12, and Riptide's seconds at 13. The skill group holds the stance change at 0, the Melee Stance's
// Six strikes at 1 to 7, the sixth of two hits at 6 and 7, its charged attack's two hits at 8 and 9, Riptide Slash at 10,
// The charged attack's stamina at 11, the stance's longest seconds at 12, the cooldown the stance's end starts from at 13
// And the cooldown after its longest at 15. The burst group holds Light of Obliteration at 0, Riptide Blast at 1, Flash
// Of Havoc at 2, the energy the ranged burst gives back at 3, the cooldown at 4 and the energy cost at 5
const TARTAGLIA_ATTACK_GROUP_ID = 3331;
const TARTAGLIA_SKILL_GROUP_ID = 3332;
const TARTAGLIA_BURST_GROUP_ID = 3339;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) tartaglia/attack.go, each arrow's hitmark and animation, and the wiki's Cutting Torrent
// Advanced properties, each arrow's poise. An arrow lands at the primary target through a box a metre long, so it is
// Priced as a circle of a metre round the body, as Fischl's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/attack.go
// https://genshin-impact.fandom.com/wiki/Cutting_Torrent
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROWS = [
  { animationFrames: 26, hitmarkFrames: 17, poiseDamage: 14.4 },
  { animationFrames: 27, hitmarkFrames: 8, poiseDamage: 16.46 },
  { animationFrames: 33, hitmarkFrames: 15, poiseDamage: 19.32 },
  { animationFrames: 32, hitmarkFrames: 19, poiseDamage: 19.89 },
  { animationFrames: 33, hitmarkFrames: 11, poiseDamage: 21.24 },
  { animationFrames: 66, hitmarkFrames: 14, poiseDamage: 25.38 },
];
// Measured: gcsim v2.47.2 (MIT) tartaglia/aimed.go, the fully charged shot at 86 frames of 94, and the wiki's 1U and 20
// Poise with no internal cooldown. https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/aimed.go
const FULL_AIM_HITMARK_FRAMES = 86;
const FULL_AIM_ANIMATION_FRAMES = 94;
const FULL_AIM_POISE_DAMAGE = 20;
// Provisional: gcsim gives Tartaglia no plunge, so the hitmarks and seconds stand in as Fischl's do. The wiki's advanced
// Properties give the collision 10 poise and the low and high plunges 50 and 100
const PLUNGE_SECONDS = 0.4;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) tartaglia/skill.go, the stance change's circle of radius 3 round the body at 16 frames of
// 39, and the 18 frames of the press back to the Ranged Stance. The wiki's Foul Legacy: Raging Tide gives the change 2U,
// Blunt, with 51.75 poise and no internal cooldown, and the 1 second before a press may end the stance
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/skill.go
// https://genshin-impact.fandom.com/wiki/Foul_Legacy:_Raging_Tide
const STANCE_CHANGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const STANCE_CHANGE_HITMARK_FRAMES = 16;
const STANCE_CHANGE_ANIMATION_FRAMES = 39;
const STANCE_CHANGE_POISE_DAMAGE = 51.75;
const STANCE_RETURN_ANIMATION_FRAMES = 18;
const STANCE_CHANGE_COOLDOWN_SECONDS = 1;
// Measured: gcsim v2.47.2 (MIT) tartaglia/attack.go, each Melee Stance strike's hitmarks, animation, and circle of a
// Radius ahead of the body by an offset in a fan, priced as its offset plus its radius; the sixth's first hit is a box 2
// Wide and 3.2 long from 0.3 ahead, priced as the circle to its far corner. The wiki's advanced properties give each hit
// 1U of Hydro under the Foul Legacy internal cooldown, and its poise
const MELEE_STRIKES = [
  { animationFrames: 23, fanDegrees: 300, hits: [{ hitmarkFrames: 8, poiseDamage: 40.68, radius: 0.8 + 1.8 }] },
  { animationFrames: 23, fanDegrees: 270, hits: [{ hitmarkFrames: 6, poiseDamage: 43.56, radius: 0.8 + 1.8 }] },
  { animationFrames: 37, fanDegrees: 300, hits: [{ hitmarkFrames: 16, poiseDamage: 58.95, radius: 0.6 + 2 }] },
  { animationFrames: 37, fanDegrees: 300, hits: [{ hitmarkFrames: 7, poiseDamage: 62.73, radius: 0.9 + 2 }] },
  { animationFrames: 23, fanDegrees: 360, hits: [{ hitmarkFrames: 7, poiseDamage: 57.87, radius: 0.6 + 2.2 }] },
  {
    animationFrames: 65,
    fanDegrees: 360,
    hits: [
      { hitmarkFrames: 4, poiseDamage: 37.08, radius: Math.hypot(0.3 + 3.2, 2 / 2) },
      { hitmarkFrames: 20, poiseDamage: 39.42, radius: 1.5 + 2.2 },
    ],
  },
];
// Measured: gcsim v2.47.2 (MIT) tartaglia/charge.go, the Melee Stance's charged attack's two circles of radius 2.2 round
// The body at 14 and 27 frames of 55, and the wiki's 1U under the Charged Attack internal cooldown with 63 and 75.33 poise
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/charge.go
const MELEE_CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.2 });
const MELEE_CHARGED_HITS = [
  { hitmarkFrames: 14, index: 8, poiseDamage: 63 },
  { hitmarkFrames: 27, index: 9, poiseDamage: 75.33 },
];
const MELEE_CHARGED_ANIMATION_FRAMES = 55;

// Measured: gcsim v2.47.2 (MIT) tartaglia/burst.go, Flash of Havoc's circle of radius 6 on the enemy aimed at 70 frames of
// 55 to cancel, its energy given back 4 frames on, and Light of Obliteration's of radius 8 round the body at 69 frames of
// 103. The wiki's Havoc: Obliteration gives both 2U with no internal cooldown, and 200 and 250 poise
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/burst.go
// https://genshin-impact.fandom.com/wiki/Havoc:_Obliteration
const FLASH_OF_HAVOC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
const FLASH_OF_HAVOC_HITMARK_FRAMES = 70;
const FLASH_OF_HAVOC_ANIMATION_FRAMES = 55;
const FLASH_OF_HAVOC_POISE_DAMAGE = 200;
const FLASH_OF_HAVOC_ENERGY_FRAMES = 4;
const LIGHT_OF_OBLITERATION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 8 });
const LIGHT_OF_OBLITERATION_HITMARK_FRAMES = 69;
const LIGHT_OF_OBLITERATION_ANIMATION_FRAMES = 103;
const LIGHT_OF_OBLITERATION_POISE_DAMAGE = 250;

// Riptide on an enemy, and the strikes it sets off: Riptide Flash, a fully charged aimed shot's three hits round an enemy
// Holding it, at most once every 0.7 seconds on each enemy; Riptide Slash, a Melee Stance Normal or Charged Attack's
// Hit round it, at most once every 1.5 seconds; Riptide Blast, Light of Obliteration's hit round it 0.8 seconds on,
// Which clears it; and Riptide Burst, round an enemy defeated holding it, which gives Riptide to the enemies it hits.
// Measured: gcsim v2.47.2 (MIT) tartaglia/riptide.go, each circle's radius, its delay and its interval, and the wiki's
// Gauges, poise and internal cooldowns, with the Blast's 0.8 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/riptide.go
const RIPTIDE_STATUS_ID = "tartaglia-riptide";
const RIPTIDE_FLASH_COOLDOWN_STATUS_ID = "tartaglia-riptide-flash-cooldown";
const RIPTIDE_FLASH_COOLDOWN_SECONDS = 42 / 60;
const RIPTIDE_FLASH_HIT_COUNT = 3;
const RIPTIDE_FLASH_POISE_DAMAGE = 20;
const RIPTIDE_SLASH_COOLDOWN_STATUS_ID = "tartaglia-riptide-slash-cooldown";
const RIPTIDE_SLASH_COOLDOWN_SECONDS = 90 / 60;
const RIPTIDE_SLASH_POISE_DAMAGE = 100;
const RIPTIDE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const RIPTIDE_BLAST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const RIPTIDE_BLAST_SECONDS = 0.8;
const RIPTIDE_BLAST_POISE_DAMAGE = 100;
const RIPTIDE_BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const RIPTIDE_BURST_HITMARK_FRAMES = 5;
const RIPTIDE_BURST_POISE_DAMAGE = 60;
// The hits Riptide sets off land a frame after the hit that sets them off, as gcsim queues them
const RIPTIDE_HITMARK_SECONDS = 1 / 60;

// Never Ending, from Ascension 1: Riptide lasts 8 seconds longer
const NEVER_ENDING_ASCENSION = 1;
const NEVER_ENDING_SECONDS = 8;
// Sword of Torrents, from Ascension 4: a CRIT hit of a Melee Stance Normal or Charged Attack gives the enemy Riptide
const SWORD_OF_TORRENTS_ASCENSION = 4;
// Foul Legacy: Tide Withholder, from one constellation: the stance's cooldown is cut by 20%
const TIDE_WITHHOLDER_CONSTELLATION = 1;
const TIDE_WITHHOLDER_COOLDOWN_MULTIPLIER = 0.8;
// Foul Legacy: Understream, from two constellations: an enemy defeated holding Riptide gives Tartaglia 4 energy
const UNDERSTREAM_CONSTELLATION = 2;
const UNDERSTREAM_ENERGY = 4;
// Abyssal Mayhem: Hydrospout, from four constellations: each enemy holding Riptide takes a Riptide Slash in the Melee
// Stance, or a Riptide Flash out of it, every 3.9 seconds as gcsim v2.47.2 (MIT) tartaglia/riptide.go measures the
// Game's 4, outside the intervals the two keep. The wiki gives its Flash 15 poise
// https://genshin-impact.fandom.com/wiki/Abyssal_Mayhem:_Hydrospout
const HYDROSPOUT_CONSTELLATION = 4;
const HYDROSPOUT_INTERVAL_SECONDS = 3.9;
const HYDROSPOUT_FLASH_POISE_DAMAGE = 15;
// Havoc: Annihilation, from six constellations: the burst cast in the Melee Stance ends the stance's cooldown as it ends
const HAVOC_ANNIHILATION_CONSTELLATION = 6;
const HAVOC_ANNIHILATION_STATUS_ID = "tartaglia-havoc-annihilation";

// Tartaglia's Melee Stance, while it holds
const findMeleeStance = (effects: readonly KitEffect[], characterId: number): KitStance | undefined =>
  effects.find((effect): effect is KitStance => effect.kind === "stance" && effect.characterId === characterId);

// A strike Riptide sets off on an enemy, landing round it from Tartaglia as he stands
const strikeRiptide = (kitEffectState: KitEffectState, enemy: Enemy, combatant: Combatant, hits: KitHit[]): void =>
  addKitEffect(kitEffectState, createKitSummon({ facing: 0, height: 0, position: enemy.position }, combatant, hits));

// Tartaglia's first kit, at talent level 1: six arrows, a fully charged aimed shot, a collision and two plunges in the
// Ranged Stance, Foul Legacy: Raging Tide's change into the Melee Stance, its six Hydro strikes, its charged attack and its
// Press back, and Havoc: Obliteration in either stance. The stance ends on a press, at its longest or as he leaves the
// Field, and its cooldown follows the seconds it held. Riptide, its strikes, the passives and the constellations answer
// The kit's events. Its multipliers are read from his proud skill groups. Master of Weaponry is not built, as no kit
// Reads a talent level, and the Melee Stance's plunges are not refused
export const createTartagliaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, TARTAGLIA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, TARTAGLIA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, TARTAGLIA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const riptideSeconds = attackTalentMultiplier(13);
  const stanceSeconds = skillTalentMultiplier(12);
  const stanceCooldownSeconds = skillTalentMultiplier(13);
  const longestStanceCooldownSeconds = skillTalentMultiplier(15);

  const createRiptideFlash = (poiseDamage: number): KitHit[] =>
    Array.from({ length: RIPTIDE_FLASH_HIT_COUNT }, () => ({
      element: Element.Hydro,
      gauge: 1,
      hitArea: RIPTIDE_HIT_AREA,
      hitmarkSeconds: RIPTIDE_HITMARK_SECONDS,
      internalCooldownTag: InternalCooldownTag.TartagliaRiptide,
      poiseDamage,
      talentMultiplier: attackTalentMultiplier(8),
    }));
  const riptideFlashHits = createRiptideFlash(RIPTIDE_FLASH_POISE_DAMAGE);
  const hydrospoutFlashHits = createRiptideFlash(HYDROSPOUT_FLASH_POISE_DAMAGE);
  const riptideSlashHit: KitHit = {
    element: Element.Hydro,
    gauge: 1,
    hitArea: RIPTIDE_HIT_AREA,
    hitmarkSeconds: RIPTIDE_HITMARK_SECONDS,
    poiseDamage: RIPTIDE_SLASH_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(10),
  };
  const riptideBlastHit: KitHit = {
    element: Element.Hydro,
    gauge: 2,
    hitArea: RIPTIDE_BLAST_HIT_AREA,
    hitmarkSeconds: RIPTIDE_BLAST_SECONDS,
    poiseDamage: RIPTIDE_BLAST_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(1),
  };
  const riptideBurstHit: KitHit = {
    element: Element.Hydro,
    gauge: 1,
    hitArea: RIPTIDE_BURST_HIT_AREA,
    hitmarkSeconds: RIPTIDE_BURST_HITMARK_FRAMES / 60,
    poiseDamage: RIPTIDE_BURST_POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(9),
  };
  const flashOfHavocHit: KitHit = {
    element: Element.Hydro,
    gauge: 2,
    hitArea: FLASH_OF_HAVOC_HIT_AREA,
    hitmarkSeconds: FLASH_OF_HAVOC_HITMARK_FRAMES / 60,
    poiseDamage: FLASH_OF_HAVOC_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(2),
  };
  const lightOfObliterationHit: KitHit = {
    element: Element.Hydro,
    gauge: 2,
    hitArea: LIGHT_OF_OBLITERATION_HIT_AREA,
    hitmarkSeconds: LIGHT_OF_OBLITERATION_HITMARK_FRAMES / 60,
    poiseDamage: LIGHT_OF_OBLITERATION_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(0),
  };
  // Riptide on an enemy for its seconds, 8 longer from Ascension 1, ticking Hydrospout from four constellations. A
  // Refresh keeps the schedule its ticks already hold
  const applyRiptide = (enemy: Enemy, { ascension, constellationCount }: Combatant): void =>
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: RIPTIDE_STATUS_ID,
      secondsRemaining: riptideSeconds + (ascension >= NEVER_ENDING_ASCENSION ? NEVER_ENDING_SECONDS : 0),
      ...(constellationCount >= HYDROSPOUT_CONSTELLATION && {
        nextTickSeconds: HYDROSPOUT_INTERVAL_SECONDS,
        tickIntervalSeconds: HYDROSPOUT_INTERVAL_SECONDS,
      }),
    });

  const meleeStanceActions: KitStance["actions"] = {
    chargedAttack: {
      hits: MELEE_CHARGED_HITS.map(({ hitmarkFrames, index, poiseDamage }) => ({
        element: Element.Hydro,
        gauge: 1,
        hitArea: MELEE_CHARGED_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.ChargedAttack,
        poiseDamage,
        talentMultiplier: skillTalentMultiplier(index),
      })),
      seconds: MELEE_CHARGED_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: skillTalentMultiplier(11),
    // Light of Obliteration lands round the body, and from six constellations it marks the stance's end to end the
    // Stance's cooldown
    elementalBurst: {
      hits: [lightOfObliterationHit],
      onStart: ({ combatant: { characterId, constellationCount }, kitEffectState }) => {
        if (constellationCount >= HAVOC_ANNIHILATION_CONSTELLATION)
          addKitEffect(kitEffectState, {
            characterId,
            id: HAVOC_ANNIHILATION_STATUS_ID,
            kind: "status",
            secondsRemaining: stanceSeconds,
          });
      },
      seconds: LIGHT_OF_OBLITERATION_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // A press back to the Ranged Stance ends the stance, whose end sets the skill's cooldown
    elementalSkill: {
      hits: [],
      onStart: ({ combatant, kitEffectState }) => {
        const stance = findMeleeStance(kitEffectState.effects, combatant.characterId);
        if (stance) stance.secondsRemaining = 0;
      },
      seconds: STANCE_RETURN_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    normalAttacks: MELEE_STRIKES.map(({ animationFrames, fanDegrees, hits }, strikeIndex): KitAction => ({
      hits: hits.map(({ hitmarkFrames, poiseDamage, radius }, hitIndex) => ({
        element: Element.Hydro,
        gauge: 1,
        hitArea: { angle: (fanDegrees * Math.PI) / 180, height: 2, radius },
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.TartagliaFoulLegacy,
        poiseDamage,
        talentMultiplier: skillTalentMultiplier(1 + strikeIndex + hitIndex),
      })),
      seconds: animationFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    })),
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    // A bow's aimed shot costs no stamina, as Amber's does not
    chargedAttack: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_AIM_HITMARK_FRAMES / 60,
          poiseDamage: FULL_AIM_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      isAimed: true,
      seconds: FULL_AIM_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    // Flash of Havoc lands on the enemy the body turned to, or round the body with none, and gives energy back
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState, target }) => {
        addKitEffect(
          kitEffectState,
          createKitSummon(
            { facing: body.facing, height: body.height, position: target?.position ?? body.position },
            combatant,
            [flashOfHavocHit],
          ),
        );
        const energySeconds = FLASH_OF_HAVOC_ENERGY_FRAMES / 60;
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: energySeconds,
          onTick: ({ party }) => gainPartyMemberEnergy(party, combatant, burstTalentMultiplier(3)),
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: energySeconds + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: FLASH_OF_HAVOC_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The stance change's hit lands round the body, and the Melee Stance holds from the press
    elementalSkill: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 2,
          hitArea: STANCE_CHANGE_HIT_AREA,
          hitmarkSeconds: STANCE_CHANGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: STANCE_CHANGE_POISE_DAMAGE,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      onStart: ({ combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          actions: meleeStanceActions,
          characterId: combatant.characterId,
          elapsedSeconds: 0,
          kind: "stance",
          secondsRemaining: stanceSeconds,
        }),
      seconds: STANCE_CHANGE_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(12),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(11),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: ARROWS.map(({ animationFrames, hitmarkFrames, poiseDamage }, index): KitAction => ({
      hits: [
        {
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: hitmarkFrames / 60,
          poiseDamage,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: animationFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    })),
    // The Melee Stance ends as Tartaglia leaves the field, and its end sets the skill's cooldown by the whole seconds it
    // Held, or its longest cooldown once it held its longest, cut from one constellation, or ends the cooldown from six
    // Once the burst was cast in it. Hydrospout's tick sets off a Slash in the Melee Stance or a Flash out of it, outside
    // Their intervals, and each hit Tartaglia lands gives and sets off Riptide
    onKitEvent: (event, { combatant, kitEffectState, party }) => {
      const { ascension, characterId, constellationCount } = combatant;
      const meleeStance = findMeleeStance(kitEffectState.effects, characterId);
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId === characterId && meleeStance) meleeStance.secondsRemaining = 0;
        return;
      }

      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind !== "stance" || effect.characterId !== characterId) return;
        const partyMember = getPartyMember(party, characterId);
        const havocAnnihilation = kitEffectState.effects.find(
          (status): status is KitStatus =>
            status.kind === "status" &&
            status.characterId === characterId &&
            status.id === HAVOC_ANNIHILATION_STATUS_ID,
        );
        if (havocAnnihilation) {
          havocAnnihilation.secondsRemaining = 0;
          partyMember.skillCooldownSeconds = 0;
          return;
        }

        partyMember.skillCooldownSeconds =
          (effect.elapsedSeconds >= stanceSeconds
            ? longestStanceCooldownSeconds
            : stanceCooldownSeconds + Math.floor(effect.elapsedSeconds)) *
          (constellationCount >= TIDE_WITHHOLDER_CONSTELLATION ? TIDE_WITHHOLDER_COOLDOWN_MULTIPLIER : 1) *
          getImpetuousWindsSkillCooldownMultiplier(combatant.elementalResonances);
        return;
      }

      if (event.kind === KitEventKind.StatusTicked) {
        const { enemy, status } = event;
        if (status.id === RIPTIDE_STATUS_ID && constellationCount >= HYDROSPOUT_CONSTELLATION)
          strikeRiptide(kitEffectState, enemy, combatant, meleeStance ? [riptideSlashHit] : hydrospoutFlashHits);
        return;
      }

      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, isCritical, isDefeated, striker } = event;
      const checkHasEnemyStatus = (statusId: string): boolean => enemy.statuses.some(({ id }) => id === statusId);
      const hadRiptide = checkHasEnemyStatus(RIPTIDE_STATUS_ID);
      let hasRiptide = hadRiptide;
      let isRiptideApplied = false;
      if (striker.characterId === characterId) {
        // Riptide Blast clears Riptide as Light of Obliteration hits, unless a Riptide Slash's interval holds it
        if (hit === lightOfObliterationHit && hasRiptide && !checkHasEnemyStatus(RIPTIDE_SLASH_COOLDOWN_STATUS_ID)) {
          enemy.statuses = enemy.statuses.filter(({ id }) => id !== RIPTIDE_STATUS_ID);
          hasRiptide = false;
          strikeRiptide(kitEffectState, enemy, combatant, [riptideBlastHit]);
        }

        const isAimedShot = !meleeStance && attackTag === AttackTag.ChargedAttack && hit.element === Element.Hydro;
        const isMeleeAttack =
          meleeStance !== undefined && (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack);
        // A fully charged aimed shot sets off Riptide Flash on Riptide the enemy held before it
        if (isAimedShot && hasRiptide && !checkHasEnemyStatus(RIPTIDE_FLASH_COOLDOWN_STATUS_ID)) {
          addEnemyStatus(enemy, {
            damageTakenBonus: 0,
            id: RIPTIDE_FLASH_COOLDOWN_STATUS_ID,
            secondsRemaining: RIPTIDE_FLASH_COOLDOWN_SECONDS,
          });
          strikeRiptide(kitEffectState, enemy, combatant, riptideFlashHits);
        }

        if (
          isAimedShot ||
          hit === flashOfHavocHit ||
          hit === riptideBurstHit ||
          (isMeleeAttack && isCritical && ascension >= SWORD_OF_TORRENTS_ASCENSION)
        ) {
          applyRiptide(enemy, combatant);
          hasRiptide = true;
          isRiptideApplied = true;
        }
        // A Melee Stance attack sets off Riptide Slash on Riptide, even Riptide the same hit gave
        if (isMeleeAttack && hasRiptide && !checkHasEnemyStatus(RIPTIDE_SLASH_COOLDOWN_STATUS_ID)) {
          addEnemyStatus(enemy, {
            damageTakenBonus: 0,
            id: RIPTIDE_SLASH_COOLDOWN_STATUS_ID,
            secondsRemaining: RIPTIDE_SLASH_COOLDOWN_SECONDS,
          });
          strikeRiptide(kitEffectState, enemy, combatant, [riptideSlashHit]);
        }
      }
      // An enemy defeated holding Riptide, or by the hit that gave it Riptide, bursts, and gives energy from two
      // Constellations
      if (!isDefeated || (!hadRiptide && !isRiptideApplied)) return;
      strikeRiptide(kitEffectState, enemy, combatant, [riptideBurstHit]);
      if (constellationCount >= UNDERSTREAM_CONSTELLATION) gainPartyMemberEnergy(party, combatant, UNDERSTREAM_ENERGY);
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(10),
    },
    skillCooldownSeconds: STANCE_CHANGE_COOLDOWN_SECONDS,
  };
};
