import type { Expedition } from "#src/models/expedition/Expedition";

// The expeditions after a character is recalled before its time is out. Its reward is forfeited with it, and a character
// Not away leaves the list as it is
export const recallExpedition = (expeditions: readonly Expedition[], characterId: number): Expedition[] =>
  expeditions.filter((expedition) => expedition.characterId !== characterId);
