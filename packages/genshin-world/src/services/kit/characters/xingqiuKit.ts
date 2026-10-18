import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

// Raincutter's sword rain falls at most one wave a second, as the wiki's Raincutter gives it, and its waves run 2, 3, 2,
// 3 swords, as gcsim v2.47.2 (MIT) xingqiu/burst.go casts them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/burst.go
const SWORD_RAIN_INTERVAL_SECONDS = 1;
const SWORD_RAIN_WAVE_SIZES = [2, 3];
const RAINCUTTER_ID = "xingqiu-raincutter";
// The first strike of a string casts its wave 7 frames on from its start, as gcsim v2.47.2 (MIT) xingqiu/xingqiu.go delays
// Its animation, and a later strike's wave is cast as it starts
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xingqiu/xingqiu.go
const RAINCUTTER_FIRST_STRIKE_DELAY_SECONDS = toKitSeconds(7);
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
// Evilsoother, from four constellations, raises Fatal Rainscreen's damage while Raincutter stands, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) xingqiu/skill.go give it
// https://genshin-impact.fandom.com/wiki/Evilsoother
const EVILSOOTHER_CONSTELLATION = 4;
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

// Whether an effect is a character's Raincutter: its summon, from which the normal attacks of the character on the
// Field set off a wave
const checkIsRaincutter = (effect: KitEffect, characterId: number): effect is KitSummon =>
  effect.kind === "summon" && effect.id === RAINCUTTER_ID && effect.combatant.characterId === characterId;

export const XINGQIU_CHARACTER_ID = 10_000_025;

// Xingqiu's behaviour: Fatal Rainscreen's hits land from a summon cast where Xingqiu stands, raised by Evilsoother from
// Four Constellations while his Raincutter stands, and the skill stands his Rain Swords round the body on the field.
// Raincutter is a summon of no hits that the normal attacks of the character on the field set off its sword rain from,
// A wave at most a second, and it stands the Rain Swords too, both lengthened by Rainbow Upon the Azure Sky from two
// Constellations, whose Hydro RES each sword takes. From Ascension 1, the Rain Swords heal the character on the field
// As they end, and from Ascension 4 Blades Amidst Raindrops adds its Hydro DMG Bonus
export const createXingqiuKitBehaviour = ({
  readHit,
  readHitFields,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const rainSwordsSeconds = readParameter("rainSwordsSeconds");
  const raincutterSeconds = readParameter("raincutterSeconds");
  const raincutterExtraSeconds = readSeconds("raincutterExtra");
  const rainSwordsSkillFirstTickSeconds = readSeconds("rainSwordsSkillFirstTick");
  const rainSwordsBurstFirstTickSeconds = readSeconds("rainSwordsBurstFirstTick");
  const rainSwordsTickIntervalSeconds = readSeconds("rainSwordsTickInterval");
  // The record holds every field of a Rain Swords tick but its hitmark, which each tick takes as the swords stand
  const rainSwordsTick = readHitFields("rainSwordsTick", ["hitmarkSeconds"]);
  const rainscreenHits = readHits("rainscreen");
  const evilsootherRainscreenHits = readHits("evilsootherRainscreen");
  // From two constellations, each sword takes Rainbow Upon the Azure Sky's Hydro RES
  const swordHit = readHit("sword", {
    enemyStatus: (combatant) =>
      combatant.constellationCount >= RAINBOW_UPON_THE_AZURE_SKY_CONSTELLATION
        ? RAINBOW_UPON_THE_AZURE_SKY_STATUS
        : undefined,
  });
  const checkIsSwordRainWave = (effect: KitEffect): effect is KitSummon =>
    effect.kind === "summon" && effect.hits.includes(swordHit);
  // The Rain Swords' Hydro on the enemies round the body on the field, from their first tick every interval until their
  // End
  const createRainSwordsTicks = (firstTickSeconds: number, endSeconds: number): KitHit[] =>
    Array.from(
      { length: Math.max(0, Math.ceil((endSeconds - firstTickSeconds) / rainSwordsTickIntervalSeconds)) },
      (_value, index): KitHit => ({
        ...rainSwordsTick,
        hitmarkSeconds: firstTickSeconds + rainSwordsTickIntervalSeconds * index,
      }),
    );
  // Stands a character's Rain Swords round the body on the field for the given seconds, or keeps those already standing
  // If they stand longer: a recast lengthens them, their ticks keeping the schedule they started on, and does not end
  // Them. From Ascension 1, a task runs as their new seconds end, and unless they were lengthened since, each sword heals
  // The character on the field by Hydropathic's share of Xingqiu's Max HP then, since no strike here shatters one
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
      castKitSummon(
        kitEffectState,
        { facing, height, position },
        combatant,
        createRainSwordsTicks(firstTickSeconds, seconds),
        { isFollowing: true, secondsRemaining: seconds },
      );
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
    scheduleKitTask(kitEffectState, combatant.characterId, seconds, (tick) => {
      // Lengthened Rain Swords still stand past this tick, and heal at their own end instead
      if (
        tick.kitEffectState.effects.some(
          (effect) => checkIsRainSwords(effect, combatant.characterId) && effect.secondsRemaining > 0,
        )
      )
        return;
      changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, heal);
    });
  };
  // A wave of swords cast where the character on the field stands as a normal attack of the character on the field
  // Starts, priced by Xingqiu, unless a wave was cast within the second. Each wave stands until Raincutter ends, so the
  // Next counts the waves before it to find its swords. From six constellations, a wave of five swords gives Xingqiu
  // His energy up to his burst's cost as it lands, through a task run then
  const castSwordRain = (
    raincutter: KitSummon,
    { body: { facing, height, position }, kitEffectState }: KitContext,
  ): void => {
    const waves = kitEffectState.effects.filter((effect) => checkIsSwordRainWave(effect));
    if (waves.some(({ elapsedSeconds }) => elapsedSeconds < SWORD_RAIN_INTERVAL_SECONDS)) return;
    const { combatant } = raincutter;
    const waveSizes =
      combatant.constellationCount >= HENCE_CALL_THEM_MY_OWN_VERSES_CONSTELLATION
        ? HENCE_CALL_THEM_MY_OWN_VERSES_WAVE_SIZES
        : SWORD_RAIN_WAVE_SIZES;
    const swordCount = takeOne(waveSizes, waves.length % waveSizes.length);
    castKitSummon(
      kitEffectState,
      { facing, height, position },
      combatant,
      Array.from({ length: swordCount }, () => swordHit),
      { secondsRemaining: Math.max(raincutter.secondsRemaining, swordHit.hitmarkSeconds + 0.1) },
    );
    if (swordCount < HENCE_CALL_THEM_MY_OWN_VERSES_SWORD_COUNT) return;
    scheduleKitTask(kitEffectState, combatant.characterId, swordHit.hitmarkSeconds, ({ party }) =>
      gainPartyMemberEnergy(party, combatant, HENCE_CALL_THEM_MY_OWN_VERSES_ENERGY),
    );
  };
  // Casts a wave from the character's Raincutter where the character on the field stands, if Raincutter stands
  const castRaincutterWave = (context: KitContext, characterId: number): void => {
    const raincutter = context.kitEffectState.effects.find((effect): effect is KitSummon =>
      checkIsRaincutter(effect, characterId),
    );
    if (raincutter) castSwordRain(raincutter, context);
  };
  return {
    // Raincutter is a summon of no hits standing for the table's seconds and the record's past them, which the normal
    // Attacks of the character on the field set off its sword rain from. The burst stands the Rain Swords for the
    // Table's seconds, lengthened by Rainbow Upon the Azure Sky from two constellations
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const seconds =
          raincutterSeconds +
          (combatant.constellationCount >= RAINBOW_UPON_THE_AZURE_SKY_CONSTELLATION
            ? RAINBOW_UPON_THE_AZURE_SKY_SECONDS
            : 0);
        castKitSummon(kitEffectState, body, combatant, [], {
          id: RAINCUTTER_ID,
          secondsRemaining: seconds + raincutterExtraSeconds,
        });
        standRainSwords(kitEffectState, body, combatant, seconds, rainSwordsBurstFirstTickSeconds);
      },
    },
    // A normal attack of the character on the field sets off a wave of swords where that character stands, while
    // Raincutter stands: the first strike of a string 7 frames on from its start, as gcsim's watcher casts it, and a
    // Later one as it starts
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.NormalAttackStarted) return;
      if (event.isFirstStrike)
        scheduleKitTask(context.kitEffectState, combatant.characterId, RAINCUTTER_FIRST_STRIKE_DELAY_SECONDS, (tick) =>
          castRaincutterWave(tick, combatant.characterId),
        );
      else castRaincutterWave(context, combatant.characterId);
    },
    getPassiveBonuses: (combatant) =>
      combatant.ascension < BLADES_AMIDST_RAINDROPS_ASCENSION
        ? []
        : [{ amount: BLADES_AMIDST_RAINDROPS_HYDRO_DAMAGE_BONUS, attribute: Attribute.HydroDamageBonus }],
    // Fatal Rainscreen's hits land from a summon cast where Xingqiu stands, so Evilsoother can raise them as the skill
    // Starts, from four constellations while his Raincutter stands. The skill stands the Rain Swords for the table's
    // Seconds
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const isEvilsoothed =
          combatant.constellationCount >= EVILSOOTHER_CONSTELLATION &&
          kitEffectState.effects.some((effect) => checkIsRaincutter(effect, combatant.characterId));
        const hits = isEvilsoothed ? evilsootherRainscreenHits : rainscreenHits;
        castKitSummon(kitEffectState, body, combatant, hits);
        standRainSwords(kitEffectState, body, combatant, rainSwordsSeconds, rainSwordsSkillFirstTickSeconds);
      },
    },
  };
};
