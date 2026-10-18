import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) eula/eula.go and skill.go, Grimheart's ICD of 18 frames on the press's strikes, which are the only
// Strikes that gain a stack
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/skill.go
const GRIMHEART_ICD_SECONDS = 0.3;
const GRIMHEART_STACK_IDS = ["eula-grimheart-stack-0", "eula-grimheart-stack-1"];
const GRIMHEART_MAX_STACKS = 2;
const GRIMHEART_ICD_ID = "eula-grimheart-icd";
const ICEWHIRL_SHRED_ID = "eula-icewhirl-shred";
// Measured: gcsim (MIT) eula/eula.go, Constellation 1's Physical DMG Bonus of 30% for 6 seconds per Grimheart stack plus 6
// Seconds, from the hold that consumes them
const CONSTELLATION_1_PHYSICAL_BONUS = 0.3;
const CONSTELLATION_1_BASE_SECONDS = 6;
const CONSTELLATION_1_SECONDS_PER_STACK = 6;
const CONSTELLATION_4_DAMAGE_BONUS = 0.25;
const CONSTELLATION_4_HEALTH_SHARE = 0.5;
// Measured: gcsim (MIT) eula/burst.go, the Lightfall Sword gaining a stack from each of Eula's strikes every 0.1 seconds,
// Up to 30
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/burst.go
const LIGHTFALL_STACK_ICD_SECONDS = 0.1;
const LIGHTFALL_STACK_ICD_ID = "eula-lightfall-stack-icd";
const LIGHTFALL_MAX_STACKS = 30;
const LIGHTFALL_STACKS_RESOURCE_ID = "eula-lightfall-stacks";
const LIGHTFALL_SUMMON_ID = "eula-lightfall";
// Constellation 6 starts the Sword with this many stacks, with its extra stack from each of Eula's strikes a random roll that
// This kit leaves out
const CONSTELLATION_6_STARTING_STACKS = 5;

const checkIsGrimheartStack = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "status" && effect.characterId === characterId && GRIMHEART_STACK_IDS.includes(effect.id);

const countGrimheartStacks = (effects: readonly KitEffect[], characterId: number): number =>
  effects.filter((effect) => checkIsGrimheartStack(effect, characterId)).length;

// Each Grimheart stack gained refreshes every stack's seconds, as gcsim refreshes its one duration, and two is the most
const gainGrimheartStack = (kitEffectState: KitEffectState, combatant: Combatant, seconds: number): void => {
  const count = Math.min(countGrimheartStacks(kitEffectState.effects, combatant.characterId) + 1, GRIMHEART_MAX_STACKS);
  for (const id of GRIMHEART_STACK_IDS.slice(0, count))
    addKitStatus(kitEffectState, combatant.characterId, { id, secondsRemaining: seconds });
};

const clearGrimheartStacks = (kitEffectState: KitEffectState, characterId: number): void =>
  removeKitEffects(kitEffectState, (effect) => checkIsGrimheartStack(effect, characterId));

export const EULA_CHARACTER_ID = 10_000_051;

// Eula's behaviour: Icetide Vortex's press gains her a Grimheart stack, and its hold spends her stacks into one Icewhirl
// Each, shredding the RES of the enemies they strike. Glacial Illumination lights the Lightfall Sword, which gains a stack
// From each of her strikes and explodes priced by them, early on a swap of characters. Her Ascension 1 Shattered Lightfall
// Sword, Ascension 4's stack, Constellation 1's Physical DMG Bonus, Constellation 4's Glacial Illumination bonus and
// Constellation 6's starting stacks are built, as is Ascension 4's reset of Icetide Vortex's cooldown. Her Constellation 2
// Hold cooldown, which the kit model cannot set per hold, is not. The Constellation 6 roll's extra stack is left out
export const createEulaKitBehaviour = ({
  kit,
  readArea,
  readHit,
  readHitFields,
  readParameter,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  // The burst's initial hit, which Constellation 4's bonus reads
  const [burstInitialHit] = kit.elementalBurst.hits;
  const explodeBase = readParameter("lightfallSwordBaseMultiplier");
  const explodePerStack = readParameter("lightfallSwordStackMultiplier");
  const shredResistance = readParameter("shredResistance");
  const shredPhysicalResistance = readParameter("shredPhysicalResistance");
  const shredSecondsPerStack = readParameter("shredSecondsPerStack");
  const grimheartSeconds = readParameter("grimheartSeconds");
  const icewhirlArea = readArea("icewhirls");
  const icewhirlHitmarkSecondsList = readSecondsList("icewhirlHitmark");
  const icewhirlMultiplier = readParameter("icewhirlMultiplier");
  const shatteredLightfall = readHit("shatteredLightfall");
  const lightfallExplosionFields = readHitFields("lightfallExplosion", ["hitmarkSeconds", "talentMultiplier"]);
  const lightfallStatusStartSeconds = readSeconds("lightfallStatusStart");
  const lightfallStatusEndSeconds = readSeconds("lightfallStatusEnd");
  const lightfallExplosionSeconds = readSeconds("lightfallExplosion");
  const lightfallTriggerDelaySeconds = readSeconds("lightfallTriggerDelay");
  // The explosion of the Lightfall Sword as the stacks it holds make it, its multiplier set by them and its hitmark at the
  // Seconds
  const createLightfallExplosion = (stacks: number, hitmarkSeconds: number): KitHit => ({
    ...lightfallExplosionFields,
    hitmarkSeconds,
    talentMultiplier: explodeBase + explodePerStack * Math.min(stacks, LIGHTFALL_MAX_STACKS),
  });
  // Each Eula strike that lands while the Sword is lit gains it a stack, once every 0.1 seconds, and rebuilds its explosion
  // From the stacks it now holds, so the explosion is priced by them when it lands
  const gainLightfallStack = (kitEffectState: KitEffectState, combatant: Combatant): void => {
    const { characterId } = combatant;
    const summon = findStandingKitSummon(kitEffectState.effects, LIGHTFALL_SUMMON_ID, characterId);
    if (
      summon === undefined ||
      summon.elapsedSeconds < lightfallStatusStartSeconds ||
      summon.elapsedSeconds >= lightfallStatusEndSeconds ||
      !startKitCooldown(kitEffectState, characterId, LIGHTFALL_STACK_ICD_ID, LIGHTFALL_STACK_ICD_SECONDS)
    )
      return;
    const count = countKitResource(kitEffectState.effects, characterId, LIGHTFALL_STACKS_RESOURCE_ID);
    if (count >= LIGHTFALL_MAX_STACKS) return;
    gainKitResource(kitEffectState, characterId, LIGHTFALL_STACKS_RESOURCE_ID, 1, LIGHTFALL_MAX_STACKS);
    const hits = [createLightfallExplosion(count + 1, lightfallExplosionSeconds)];
    kitEffectState.effects = kitEffectState.effects.map((effect) => (effect === summon ? { ...summon, hits } : effect));
  };
  const lightfallStackHit: KitHitBehaviour = {
    onStrike: ({ kitEffectState }, { combatant }) => gainLightfallStack(kitEffectState, combatant),
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        const { characterId } = combatant;
        // Ascension 4 resets Icetide Vortex's cooldown, as gcsim v2.47.2 (MIT) eula/asc.go's a4() resets the skill's
        // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/eula/asc.go
        if (combatant.ascension >= 4) getPartyMember(party, characterId).skillCooldownSeconds = 0;
        // A fresh cast takes the Sword's stacks from zero, as the cast resets them, Constellation 6 starting it with five
        spendKitResource(kitEffectState, characterId, LIGHTFALL_STACKS_RESOURCE_ID);
        removeKitEffects(kitEffectState, (effect) => effect.kind === "summon" && effect.id === LIGHTFALL_SUMMON_ID);
        // Ascension 4 gains a Grimheart stack, which gcsim keeps only while the Grimheart it adds to is up
        if (combatant.ascension >= 4 && countGrimheartStacks(kitEffectState.effects, characterId) > 0)
          gainGrimheartStack(kitEffectState, combatant, grimheartSeconds);
        const startingStacks = combatant.constellationCount >= 6 ? CONSTELLATION_6_STARTING_STACKS : 0;
        gainKitResource(
          kitEffectState,
          characterId,
          LIGHTFALL_STACKS_RESOURCE_ID,
          startingStacks,
          LIGHTFALL_MAX_STACKS,
        );
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          [createLightfallExplosion(startingStacks, lightfallExplosionSeconds)],
          { id: LIGHTFALL_SUMMON_ID },
        );
      },
    },
    getStrikeDamageBonus: ({ combatant, hit }, enemy) =>
      combatant.constellationCount >= 4 &&
      hit === burstInitialHit &&
      enemy.health / enemy.maxHealth < CONSTELLATION_4_HEALTH_SHARE
        ? CONSTELLATION_4_DAMAGE_BONUS
        : 0,
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => lightfallStackHit) })),
    // A swap of characters ends the Sword early: its explosion lands the trigger's delay on, priced by the stacks it holds
    // Then
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.CharacterSwapped) return;
      const summon = findStandingKitSummon(kitEffectState.effects, LIGHTFALL_SUMMON_ID, characterId);
      if (summon === undefined) return;
      const stacks = spendKitResource(kitEffectState, characterId, LIGHTFALL_STACKS_RESOURCE_ID);
      const hit = createLightfallExplosion(stacks, lightfallTriggerDelaySeconds);
      removeKitEffects(kitEffectState, (effect) => effect === summon);
      castKitSummon(kitEffectState, summon.body, summon.combatant, [hit]);
    },
    skill: {
      hits: [
        {
          onStrike: ({ kitEffectState }, { combatant }) => {
            if (!startKitCooldown(kitEffectState, combatant.characterId, GRIMHEART_ICD_ID, GRIMHEART_ICD_SECONDS))
              return;
            gainGrimheartStack(kitEffectState, combatant, grimheartSeconds);
            gainLightfallStack(kitEffectState, combatant);
          },
        },
      ],
    },
    skillHolds: [
      {
        hits: [lightfallStackHit],
        onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
          const { characterId } = combatant;
          const stacks = countGrimheartStacks(kitEffectState.effects, characterId);
          clearGrimheartStacks(kitEffectState, characterId);
          if (stacks === 0) return;
          // Each stack sets off one Icewhirl, each shredding the RES of the enemy it strikes for the seconds per stack
          const shred = (): EnemyStatus => ({
            damageTakenBonus: 0,
            id: ICEWHIRL_SHRED_ID,
            physicalResistanceReduction: shredPhysicalResistance,
            resistanceReduction: { [Element.Cryo]: shredResistance },
            secondsRemaining: shredSecondsPerStack * stacks,
          });
          const icewhirls: KitHit[] = icewhirlHitmarkSecondsList
            .slice(0, stacks)
            .map((hitmarkSeconds) => ({
              element: Element.Cryo,
              enemyStatus: shred,
              gauge: 1,
              hitArea: icewhirlArea,
              hitmarkSeconds,
              onStrike: ({ kitEffectState: strikeEffectState }, { combatant: striker }) =>
                gainLightfallStack(strikeEffectState, striker),
              poiseDamage: 0,
              talentMultiplier: icewhirlMultiplier,
            }));
          castKitSummon(kitEffectState, body, combatant, icewhirls);
          // Two stacks raise a Shattered Lightfall Sword at Ascension 1, which explodes on its own once the hold has begun
          if (stacks === GRIMHEART_MAX_STACKS && combatant.ascension >= 1)
            castKitSummon(kitEffectState, body, combatant, [shatteredLightfall]);
          // Constellation 1's bonus lasts six seconds plus six for each stack consumed
          if (combatant.constellationCount >= 1)
            buffKitMember(kitEffectState, characterId, {
              amount: CONSTELLATION_1_PHYSICAL_BONUS,
              attribute: Attribute.PhysicalDamageBonus,
              secondsRemaining: CONSTELLATION_1_BASE_SECONDS + CONSTELLATION_1_SECONDS_PER_STACK * stacks,
              source: "eula-c1",
            });
        },
      },
    ],
  };
};
