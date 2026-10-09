// One place as the world reads it: its id, the text id of its name, the Adventure Rank it opens at, the scene point of the
// Statue that must be resonated with (zero for none) and the quest that must be finished (empty for none), and each
// Duration it offers with the items a claim of it draws, each count a range of its minimum and maximum
export interface ExpeditionPlaceRow {
  durations: { hours: number; items: { itemId: number; maxCount: number; minCount: number }[] }[];
  id: number;
  nameTextId: string;
  questId: string;
  rankLevel: number;
  statuePointId: number;
}
