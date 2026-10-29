import type { ExpeditionRegion } from "genshin-world";

// One place as the world reads it: its id, the text id of its name and of its description, the Adventure Rank it opens at,
// The scene point of the Statue that must be resonated with (zero for none), the quest that must be finished (empty for
// None) and the region it is in, and each Duration it offers with the items a claim of it draws, each count a range of its
// Minimum and maximum
export interface ExpeditionPlaceRow {
  descriptionTextId: string;
  durations: { hours: number; items: { itemId: number; maxCount: number; minCount: number }[] }[];
  id: number;
  nameTextId: string;
  questId: string;
  rankLevel: number;
  region: ExpeditionRegion;
  statuePointId: number;
}
