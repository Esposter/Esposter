// A material an enemy's family drops, by the game's item id: its tier, from 0, which decides the level it starts
// Dropping at and how often, and how many drop on average at the highest level band
export interface EnemyMaterialDrop {
  expectedCount: number;
  itemId: number;
  tier: number;
}
