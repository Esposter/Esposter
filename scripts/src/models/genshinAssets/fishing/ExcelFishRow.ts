// One fish of the game's fish table: its hit points, the ranges it attracts to and flees from a lure, the bite's timeout,
// The feeler range it nibbles over, the moving zone its tension is held in while reeled, and the item it becomes
export interface ExcelFishRow {
  attractRange: number;
  biteTimeout: number;
  bonusDuration: number[];
  bonusOffset: number[];
  bonusSpeed: number[];
  bonusWidth: number;
  feelerTimes: number[];
  fleeRange: number;
  hp: number;
  id: number;
  itemId: number;
}
