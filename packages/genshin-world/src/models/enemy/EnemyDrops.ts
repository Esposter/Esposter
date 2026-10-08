import type { DroppedItem } from "#src/models/enemy/DroppedItem";

// What a defeated enemy leaves: Mora, Character EXP for the party, and its family's materials
export interface EnemyDrops {
  characterExperience: number;
  materials: DroppedItem[];
  mora: number;
}
