import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

const SESSHOU_SAKURA_ID = "yae-sesshou-sakura";

// Measured: gcsim v2.47.2 (MIT) yaemiko/kitsune.go, the totems stand at most three, and a fourth pops the oldest
const MAXIMUM_TOTEMS = 3;

// A character's totems still standing, oldest first, as the effects are kept in the order they were added
const findStandingTotems = (effects: KitEffect[], characterId: number): KitSummon[] =>
  effects.filter(
    (effect): effect is KitSummon =>
      effect.kind === "summon" &&
      effect.id === SESSHOU_SAKURA_ID &&
      effect.combatant.characterId === characterId &&
      effect.secondsRemaining > 0,
  );

export const YAE_MIKO_CHARACTER_ID = 10_000_058;

// Yae Miko's behaviour: Sesshou Sakura's totems, which strike on their own schedule at a level by how many stand, and
// Great Secret Art: Tenko Kenshin, which destroys the totems for a Tenko Thunderbolt each. Her passives and
// Constellations are not built, as the kit's events reach none of them yet
// Constellation 1 needs the Tenko Thunderbolt's activation as an event, which the kit does not emit
// Constellation 2 needs Sesshou Sakura's starting level, max level and range, which the kit does not build
// Constellation 4 needs the Electro DMG Bonus from Sesshou Sakura's lightning hits, which the kit does not build
// Constellation 6 needs the Sesshou Sakura's DEF ignore, which no strike hook carries
export const createYaeMikoKitBehaviour = ({
  readHitFields,
  readHits,
  readParameters,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const totemSeconds = readSeconds("totem");
  // A totem's strikes over its life, gcsim v2.47.2's (MIT) yaemiko/kitsune.go schedule from the press
  const totemStrikeSecondsList = readSecondsList("totemStrikes");
  const skillSpawnSeconds = readSeconds("sesshouSakuraSpawn");
  const totemStrikeFields = readHitFields("totemStrikes", ["hitmarkSeconds", "talentMultiplier"]);
  // A totem's strike multiplier at each of its levels, which the totems standing pick as it is cast
  const totemStrikeMultipliers = readParameters("totemStrikeMultipliers");
  // A Tenko Thunderbolt for each totem the burst can destroy, in the order it destroys them
  const thunderbolts = readHits("tenkoThunderbolts");
  // Each totem's strikes are fixed when it is cast, so its multiplier is the one its level gives then, as the level is
  // Read from the totems standing as it is cast
  const createTotemStrikes = (level: number): KitHit[] => {
    const talentMultiplier = takeOne(totemStrikeMultipliers, level - 1);
    const hits: KitHit[] = [];
    for (const hitmarkSeconds of totemStrikeSecondsList)
      hits.push({ ...totemStrikeFields, hitmarkSeconds, talentMultiplier });
    return hits;
  };
  return {
    // Destroys every totem standing, each one a Tenko Thunderbolt that strikes from the burst's own clock
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const standingTotems = findStandingTotems(kitEffectState.effects, combatant.characterId);
        for (const totem of standingTotems) totem.secondsRemaining = 0;
        if (standingTotems.length === 0) return;
        castKitSummon(kitEffectState, body, combatant, thunderbolts.slice(0, standingTotems.length));
      },
    },
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const standingTotems = findStandingTotems(kitEffectState.effects, combatant.characterId);
        // A fourth totem pops the oldest
        for (const oldestTotem of standingTotems.slice(0, Math.max(0, standingTotems.length - MAXIMUM_TOTEMS + 1)))
          oldestTotem.secondsRemaining = 0;
        const level = Math.min(standingTotems.length + 1, MAXIMUM_TOTEMS);
        castKitSummon(kitEffectState, body, combatant, createTotemStrikes(level), {
          id: SESSHOU_SAKURA_ID,
          secondsRemaining: totemSeconds,
          spawnSeconds: skillSpawnSeconds,
        });
      },
    },
  };
};
