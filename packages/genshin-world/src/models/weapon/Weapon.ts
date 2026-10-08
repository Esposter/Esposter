// A weapon the player has, by its data's id, and how far it has grown: its level, the EXP it holds towards the next
// Level, its ascension phase, and its refinement rank from one to five
export interface Weapon {
  ascension: number;
  experience: number;
  id: number;
  level: number;
  refinement: number;
}
