import type { Moondrift } from "#src/models/party/Moondrift";

// The party's Lunar-Crystallize: how many it has triggered toward the next Moondrift Harmony, the ids of the characters
// Contributing to it, the seconds before a Harmony may resonate again, and the Moondrifts standing
export interface PartyLunarCrystallize {
  contributorIds: Set<number>;
  count: number;
  harmonyCooldownSeconds: number;
  moondrifts: Moondrift[];
}
