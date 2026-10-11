// One item finishing a quest series gives: its id in the game's tables, how many, and its rarity in stars, which colours
// Its tile
export interface QuestReward {
  count: number;
  itemId: number;
  rarity: number;
}
