import type { ExpeditionRegion } from "genshin-world";

// One place as the world reads it: its id, the text id of its name and of its description, the Adventure Rank it opens
// At, the scene point of the Statue that must be resonated with (zero for none), the quest that must be finished (empty
// For none) and the region it is in, and each Duration it offers with the items a claim of it draws, each count a range
// Of its minimum and maximum
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
