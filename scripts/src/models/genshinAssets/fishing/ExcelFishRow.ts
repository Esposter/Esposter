import type { Fish } from "genshin-world";

// One fish of the game's fish table: the fish's own record, and the monster it is filed under, whose feature tag group
// Holds the tags its bait draws on
export interface ExcelFishRow extends Fish {
  monsterId: number;
}
