import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

// A summon's clock run on by a step: each hit whose hitmark falls within it lands from the summon's body, as the hits
// Of an action do
export const stepKitSummon = (summon: KitSummon, stepSeconds: number): KitStrike[] => {
  const fromSeconds = summon.elapsedSeconds;
  summon.elapsedSeconds += stepSeconds;
  return summon.hits
    .filter(({ hitmarkSeconds }) => hitmarkSeconds > fromSeconds && hitmarkSeconds <= summon.elapsedSeconds)
    .map((hit) => ({ body: summon.body, combatant: summon.combatant, hit }));
};
