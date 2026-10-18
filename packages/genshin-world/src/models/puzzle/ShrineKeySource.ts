// One place a Shrine of Depths key is given: the quest whose reward names it, the key's item and the region it opens
// Shrines of. Each source stands on its own, so a key a quest and a statue both give is two sources
export interface ShrineKeySource {
  id: string;
  keyItemId: number;
  keyRegion: string;
  questId: number;
  rewardId: number;
}
