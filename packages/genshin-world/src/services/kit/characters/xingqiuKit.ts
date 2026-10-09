import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { takeOne } from "@esposter/shared";

// Xingqiu's proud skill groups, read at his talent level. The attack group holds the five strikes' hits at 0 to 6, the
// Third and fifth strikes each of two, the charged attack's two hits at 7 and 8 and its stamina at 9, and the plunges'
// Collision, low and high at 10, 11 and 12. The skill group holds Fatal Rainscreen's two hits at 0 and 1, the Rain
// Swords' seconds at 3 and the skill's cooldown at 4. The burst group holds a sword's damage at 0, Raincutter's seconds
// At 1, and the burst's cooldown and energy cost at 2 and 3
const XINGQIU_ATTACK_GROUP_ID = 2531;
const XINGQIU_SKILL_GROUP_ID = 2532;
const XINGQIU_BURST_GROUP_ID = 2539;

// Measured: gcsim v2.47.2 (MIT) xingqiu/attack.go, the first and second strikes' circles of radius 1.5 centred 0.8 metres
// Ahead, the third's two of radius 1.5 centred 0.6 ahead and the fifth's second of radius 2 centred 0.8 ahead, each
// Priced as its offset plus its radius. The fourth's box and the fifth's first, 1 wide and 2 long from the body, which
// Gcsim spawns on its near edge, are each priced as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 1.5 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.5 });
const BOX_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(2, 1 / 2) });
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 2 });
// Measured: gcsim v2.47.2 (MIT) xingqiu/charge.go, both slashes a circle of radius 2.2 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/charge.go
const CHARGED_ATTACK_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.2 });
// Provisional: gcsim has no plunge file for Xingqiu, so the plunges' reach is Jean's and Beidou's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) xingqiu/skill.go, Fatal Rainscreen's first circle of radius 3 centred 0.8 metres ahead, and
// Its second box 3.5 wide and 4.5 long from 1.5 metres behind, priced as the circle to its far corner. The Rain Swords'
// Hydro is orbital.go's circle of radius 1.2 round the body on the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/skill.go
const FIRST_RAINSCREEN_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 3 });
const SECOND_RAINSCREEN_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(4.5 - 1.5, 3.5 / 2),
});
const RAIN_SWORDS_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.2 });
// Provisional: gcsim v2.47.2 (MIT) xingqiu/burst.go drops each sword as a circle of radius 0.5 on the primary target, which
// An area does not hold, so a sword reaches the 5 metres an attack targets within, as Ayaka's charged attack does
const SWORD_RAIN_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) xingqiu/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, with
// The attack group's index of each hit. Each hit's poise is the wiki's Guhua Style advanced properties
const XINGQIU_STRIKES = [
  { frames: 35, hits: [{ groupIndex: 0, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 10, poiseDamage: 47.7 }] },
  { frames: 29, hits: [{ groupIndex: 1, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 13, poiseDamage: 49.5 }] },
  {
    frames: 35,
    hits: [
      { groupIndex: 2, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 9, poiseDamage: 29.3 },
      { groupIndex: 3, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 19, poiseDamage: 29.3 },
    ],
  },
  { frames: 33, hits: [{ groupIndex: 4, hitArea: BOX_STRIKE_HIT_AREA, hitmarkFrames: 17, poiseDamage: 57.6 }] },
  {
    frames: 66,
    hits: [
      { groupIndex: 5, hitArea: BOX_STRIKE_HIT_AREA, hitmarkFrames: 18, poiseDamage: 36.81 },
      { groupIndex: 6, hitArea: FIFTH_STRIKE_HIT_AREA, hitmarkFrames: 39, poiseDamage: 36.81 },
    ],
  },
];

// Measured: gcsim v2.47.2 (MIT) xingqiu/charge.go, the slashes at 8 and 20 frames after a strike and the animation's 58
const CHARGED_ATTACK_HITMARK_FRAMES = [8, 20];
const CHARGED_ATTACK_FRAMES = 58;
// Measured: gcsim v2.47.2 (MIT) xingqiu/skill.go, Fatal Rainscreen's hits at 12 and 31 frames and the animation's 67
const RAINSCREEN_HITS = [
  { hitArea: FIRST_RAINSCREEN_HIT_AREA, hitmarkFrames: 12 },
  { hitArea: SECOND_RAINSCREEN_HIT_AREA, hitmarkFrames: 31 },
];
const SKILL_FRAMES = 67;
// Measured: gcsim v2.47.2 (MIT) xingqiu/orbital.go, the Rain Swords' Hydro on what touches the body on the field 44
// Frames past the skill or 19 past the burst, then every 135, the wiki's 2.25 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/orbital.go
const RAIN_SWORDS_SKILL_FIRST_TICK_FRAMES = 44;
const RAIN_SWORDS_BURST_FIRST_TICK_FRAMES = 19;
const RAIN_SWORDS_TICK_INTERVAL_FRAMES = 135;
// Measured: gcsim v2.47.2 (MIT) xingqiu/burst.go, the animation's 40 frames and Raincutter's 33 frames past its seconds.
// Each wave's swords land 20 frames past the normal attack that set it off, at most one wave a second, as the wiki's
// Raincutter gives the second, and the waves run 2, 3, 2, 3 swords
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/burst.go
const BURST_FRAMES = 40;
const RAINCUTTER_EXTRA_FRAMES = 33;
const SWORD_RAIN_HITMARK_FRAMES = 20;
const SWORD_RAIN_INTERVAL_SECONDS = 1;
const SWORD_RAIN_WAVE_SIZES = [2, 3];
// Hydropathic, from Ascension 1, heals the character on the field by 6% of Xingqiu's Max HP as each Rain Sword shatters
// Or its seconds end, as the wiki's passive page gives it. The Rain Swords number 3, and 4 from The Scent Remained at one
// Constellation
// https://genshin-impact.fandom.com/wiki/Hydropathic
const HYDROPATHIC_ASCENSION = 1;
const HYDROPATHIC_MAX_HEALTH_SHARE = 0.06;
const RAIN_SWORD_COUNT = 3;
const THE_SCENT_REMAINED_CONSTELLATION = 1;
// Blades Amidst Raindrops, from Ascension 4, gives Xingqiu a 20% Hydro DMG Bonus, as the wiki's passive page and gcsim
// V2.47.2 (MIT) xingqiu/asc.go give it
// https://genshin-impact.fandom.com/wiki/Blades_Amidst_Raindrops
const BLADES_AMIDST_RAINDROPS_ASCENSION = 4;
const BLADES_AMIDST_RAINDROPS_HYDRO_DAMAGE_BONUS = 0.2;
// Rainbow Upon the Azure Sky, from two constellations, lengthens Raincutter by 3 seconds and takes 15% off the Hydro RES of
// Each enemy a sword strikes for 4 seconds, as the wiki's constellation page and gcsim v2.47.2 (MIT) xingqiu/burst.go
// Give it
// https://genshin-impact.fandom.com/wiki/Rainbow_Upon_the_Azure_Sky
const RAINBOW_UPON_THE_AZURE_SKY_CONSTELLATION = 2;
const RAINBOW_UPON_THE_AZURE_SKY_SECONDS = 3;
const RAINBOW_UPON_THE_AZURE_SKY_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "xingqiu-rainbow-upon-the-azure-sky",
  resistanceReduction: { [Element.Hydro]: 0.15 },
  secondsRemaining: 4,
};
// Evilsoother, from four constellations, raises Fatal Rainscreen's damage by half while Raincutter stands, a Base DMG
// Multiplier of 1.5 as the wiki's constellation page gives it and gcsim v2.47.2 (MIT) xingqiu/skill.go multiplies it
// https://genshin-impact.fandom.com/wiki/Evilsoother
const EVILSOOTHER_CONSTELLATION = 4;
const EVILSOOTHER_MULTIPLIER = 1.5;
// Hence, Call Them My Own Verses, from six constellations, makes every third wave 5 swords, whose hit gives Xingqiu 3
// Energy, as the wiki's constellation page and gcsim v2.47.2 (MIT) xingqiu/burst.go give it
// https://genshin-impact.fandom.com/wiki/Hence,_Call_Them_My_Own_Verses
const HENCE_CALL_THEM_MY_OWN_VERSES_CONSTELLATION = 6;
const HENCE_CALL_THEM_MY_OWN_VERSES_SWORD_COUNT = 5;
const HENCE_CALL_THEM_MY_OWN_VERSES_WAVE_SIZES = [2, 3, HENCE_CALL_THEM_MY_OWN_VERSES_SWORD_COUNT];
const HENCE_CALL_THEM_MY_OWN_VERSES_ENERGY = 3;

// Whether an effect is a character's Rain Swords: its summon that follows the body on the field
const checkIsRainSwords = (effect: KitEffect, characterId: number): effect is KitSummon =>
  effect.kind === "summon" && effect.isFollowing === true && effect.combatant.characterId === characterId;

// Whether an effect is a character's Raincutter: its summon that the normal attacks of the character on the field set off
const checkIsRaincutter = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "summon" && effect.onNormalAttackStart !== undefined && effect.combatant.characterId === characterId;

// The Rain Swords' Hydro on the enemies round the body on the field, from their first tick every 2.25 seconds until their
// End, each 1U with no damage, internal cooldown or poise, as gcsim's orbital.go deals it
const createRainSwordsTicks = (firstTickSeconds: number, endSeconds: number): KitHit[] => {
  const intervalSeconds = RAIN_SWORDS_TICK_INTERVAL_FRAMES / 60;
  return Array.from(
    { length: Math.max(0, Math.ceil((endSeconds - firstTickSeconds) / intervalSeconds)) },
    (_value, index): KitHit => ({
      element: Element.Hydro,
      gauge: 1,
      hitArea: RAIN_SWORDS_HIT_AREA,
      hitmarkSeconds: firstTickSeconds + intervalSeconds * index,
      poiseDamage: 0,
      talentMultiplier: 0,
    }),
  );
};

// Stands a character's Rain Swords round the body on the field for the given seconds, or keeps those already standing if
// They stand longer: a recast lengthens them, their ticks keeping the schedule they started on, and does not end them.
// From Ascension 1, a field with no edge ticks as their new seconds end, and unless they were lengthened since, each sword
// Heals the character on the field by Hydropathic's share of Xingqiu's Max HP then, since no strike here shatters one
const standRainSwords = (
  kitEffectState: KitEffectState,
  { facing, height, position }: KitBody,
  combatant: Combatant,
  seconds: number,
  firstTickSeconds: number,
): void => {
  const rainSwords = kitEffectState.effects.find((effect) => checkIsRainSwords(effect, combatant.characterId));
  if (rainSwords !== undefined && rainSwords.secondsRemaining >= seconds) return;
  if (rainSwords === undefined)
    addKitEffect(kitEffectState, {
      body: { facing, height, position: { x: position.x, z: position.z } },
      combatant,
      elapsedSeconds: 0,
      hits: createRainSwordsTicks(firstTickSeconds, seconds),
      isFollowing: true,
      kind: "summon",
      secondsRemaining: seconds,
    });
  else
    kitEffectState.effects = kitEffectState.effects.map((effect): KitEffect =>
      effect === rainSwords
        ? {
            ...rainSwords,
            hits: createRainSwordsTicks(takeOne(rainSwords.hits).hitmarkSeconds, rainSwords.elapsedSeconds + seconds),
            secondsRemaining: seconds,
          }
        : effect,
    );
  if (combatant.ascension < HYDROPATHIC_ASCENSION) return;
  const swordCount = RAIN_SWORD_COUNT + (combatant.constellationCount >= THE_SCENT_REMAINED_CONSTELLATION ? 1 : 0);
  const heal = swordCount * HYDROPATHIC_MAX_HEALTH_SHARE * combatant.attributes.maxHealth;
  addKitEffect(kitEffectState, {
    centre: { x: position.x, z: position.z },
    characterId: combatant.characterId,
    kind: "field",
    nextTickSeconds: seconds,
    onTick: ({ activeCombatant, kitEffectState: tickKitEffectState, party }) => {
      // Lengthened Rain Swords still stand past this tick, and heal at their own end instead
      if (
        tickKitEffectState.effects.some(
          (effect) => checkIsRainSwords(effect, combatant.characterId) && effect.secondsRemaining > 0,
        )
      )
        return;
      healPartyMember(party, activeCombatant.characterId, heal / activeCombatant.attributes.maxHealth);
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    // The field lives a tenth of a second past its tick, so the step that runs it still has it
    secondsRemaining: seconds + 0.1,
    tickIndex: 0,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  });
};

// Xingqiu's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Fatal Rainscreen's
// Two hits and its Rain Swords, and Raincutter's sword rain on the normal attacks of the character on the field. Its
// Multipliers are read from his proud skill groups
export const createXingqiuKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const rainSwordsSeconds = getTalentMultiplier(talentMultiplierMap, XINGQIU_SKILL_GROUP_ID, TALENT_START_LEVEL, 3);
  const raincutterSeconds = getTalentMultiplier(talentMultiplierMap, XINGQIU_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  // A sword's strikes are physical under the Normal Attack internal cooldown
  const normalAttacks = XINGQIU_STRIKES.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitArea, hitmarkFrames, poiseDamage }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage,
      talentMultiplier: getTalentMultiplier(
        talentMultiplierMap,
        XINGQIU_ATTACK_GROUP_ID,
        TALENT_START_LEVEL,
        groupIndex,
      ),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // The wiki's Fatal Rainscreen gives each hit 1U of Hydro with no internal cooldown and 120 poise
  const rainscreenHits = RAINSCREEN_HITS.map(({ hitArea, hitmarkFrames }, index): KitHit => ({
    element: Element.Hydro,
    gauge: 1,
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 120,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINGQIU_SKILL_GROUP_ID, TALENT_START_LEVEL, index),
  }));
  const evilsootherRainscreenHits = rainscreenHits.map((hit): KitHit => ({
    ...hit,
    talentMultiplier: EVILSOOTHER_MULTIPLIER * hit.talentMultiplier,
  }));
  // The wiki's Raincutter gives each sword 1U of Hydro under the Elemental Burst internal cooldown and 25 poise, and from
  // Two constellations each takes Rainbow Upon the Azure Sky's Hydro RES
  const swordHit: KitHit = {
    element: Element.Hydro,
    enemyStatus: (combatant) =>
      combatant.constellationCount >= RAINBOW_UPON_THE_AZURE_SKY_CONSTELLATION
        ? RAINBOW_UPON_THE_AZURE_SKY_STATUS
        : undefined,
    gauge: 1,
    hitArea: SWORD_RAIN_HIT_AREA,
    hitmarkSeconds: SWORD_RAIN_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 25,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINGQIU_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const checkIsSwordRainWave = (effect: KitEffect): effect is KitSummon =>
    effect.kind === "summon" && effect.hits.includes(swordHit);
  // A wave of swords cast where the character on the field stands as it starts a normal attack, priced by Xingqiu, unless
  // A wave was cast within the second. Each wave stands until Raincutter ends, so the next counts the waves before it to
  // Find its swords. From six constellations, a wave of five swords gives Xingqiu his energy up to his burst's cost as it
  // Lands, through a field with no edge that ticks once then
  const castSwordRain = (
    raincutter: KitSummon,
    { body: { facing, height, position }, kitEffectState }: KitStepContext,
  ): void => {
    const waves = kitEffectState.effects.filter(checkIsSwordRainWave);
    if (waves.some(({ elapsedSeconds }) => elapsedSeconds < SWORD_RAIN_INTERVAL_SECONDS)) return;
    const { combatant } = raincutter;
    const waveSizes =
      combatant.constellationCount >= HENCE_CALL_THEM_MY_OWN_VERSES_CONSTELLATION
        ? HENCE_CALL_THEM_MY_OWN_VERSES_WAVE_SIZES
        : SWORD_RAIN_WAVE_SIZES;
    const swordCount = takeOne(waveSizes, waves.length % waveSizes.length);
    addKitEffect(kitEffectState, {
      body: { facing, height, position: { x: position.x, z: position.z } },
      combatant,
      elapsedSeconds: 0,
      hits: Array.from({ length: swordCount }, () => swordHit),
      kind: "summon",
      secondsRemaining: Math.max(raincutter.secondsRemaining, swordHit.hitmarkSeconds + 0.1),
    });
    if (swordCount < HENCE_CALL_THEM_MY_OWN_VERSES_SWORD_COUNT) return;
    addKitEffect(kitEffectState, {
      centre: { x: position.x, z: position.z },
      characterId: combatant.characterId,
      kind: "field",
      nextTickSeconds: swordHit.hitmarkSeconds,
      onTick: ({ party }) => {
        const partyMember = getPartyMember(party, combatant.characterId);
        partyMember.energy = Math.min(
          combatant.kit.burstEnergyCost,
          partyMember.energy + HENCE_CALL_THEM_MY_OWN_VERSES_ENERGY,
        );
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      // The field lives a tenth of a second past its tick, so the step that runs it still has it
      secondsRemaining: swordHit.hitmarkSeconds + 0.1,
      tickIndex: 0,
      tickIntervalSeconds: Number.POSITIVE_INFINITY,
    });
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XINGQIU_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, XINGQIU_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    // The wiki's Guhua Style gives both slashes 50.3 poise under the Normal Attack internal cooldown
    chargedAttack: {
      hits: CHARGED_ATTACK_HITMARK_FRAMES.map((hitmarkFrames, index) => ({
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 50.3,
        talentMultiplier: getTalentMultiplier(
          talentMultiplierMap,
          XINGQIU_ATTACK_GROUP_ID,
          TALENT_START_LEVEL,
          7 + index,
        ),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's, the wiki's and gcsim's 20 stamina, spent as the charged attack starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, XINGQIU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
    // Raincutter is a summon of no hits standing for the group's seconds and gcsim's 33 frames, which the normal attacks of
    // The character on the field set its sword rain off from. The burst stands the Rain Swords for the group's seconds,
    // Lengthened by Rainbow Upon the Azure Sky from two constellations
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        const seconds =
          raincutterSeconds +
          (combatant.constellationCount >= RAINBOW_UPON_THE_AZURE_SKY_CONSTELLATION
            ? RAINBOW_UPON_THE_AZURE_SKY_SECONDS
            : 0);
        const raincutter: KitSummon = {
          body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
          combatant,
          elapsedSeconds: 0,
          hits: [],
          kind: "summon",
          onNormalAttackStart: (context) => castSwordRain(raincutter, context),
          secondsRemaining: seconds + RAINCUTTER_EXTRA_FRAMES / 60,
        };
        addKitEffect(kitEffectState, raincutter);
        standRainSwords(kitEffectState, body, combatant, seconds, RAIN_SWORDS_BURST_FIRST_TICK_FRAMES / 60);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Fatal Rainscreen's hits land from a summon cast where Xingqiu stands, so Evilsoother can raise them as the skill
    // Starts, from four constellations while his Raincutter stands. The skill stands the Rain Swords for the group's seconds
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        const isEvilsoothed =
          combatant.constellationCount >= EVILSOOTHER_CONSTELLATION &&
          kitEffectState.effects.some((effect) => checkIsRaincutter(effect, combatant.characterId));
        const hits = isEvilsoothed ? evilsootherRainscreenHits : rainscreenHits;
        addKitEffect(kitEffectState, {
          body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
          combatant,
          elapsedSeconds: 0,
          hits,
          kind: "summon",
          // The hits land a tenth of a second inside its seconds, so the step that lands the last still has it
          secondsRemaining: Math.max(...hits.map(({ hitmarkSeconds }) => hitmarkSeconds)) + 0.1,
        });
        standRainSwords(kitEffectState, body, combatant, rainSwordsSeconds, RAIN_SWORDS_SKILL_FIRST_TICK_FRAMES / 60);
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getPassiveBonuses: (combatant) =>
      combatant.ascension < BLADES_AMIDST_RAINDROPS_ASCENSION
        ? []
        : [{ amount: BLADES_AMIDST_RAINDROPS_HYDRO_DAMAGE_BONUS, attribute: Attribute.HydroDamageBonus }],
    // Provisional: gcsim has no plunge file for Xingqiu and no source gives his plunges' landing frames, so each hits as
    // Its action starts, as Jean's and Beidou's do. The wiki's Guhua Style gives them 100 and 150 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINGQIU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 12),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINGQIU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 11),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, XINGQIU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
    },
    // The group's, the wiki's and gcsim's 21 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XINGQIU_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  };
};
