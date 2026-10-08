import type { EnemyMaterialDrop } from "#src/models/enemy/EnemyMaterialDrop";

// What a drop family's enemies drop: its base Mora, which each level band scales, and its materials
export interface EnemyDropTable {
  materials: EnemyMaterialDrop[];
  mora: number;
}
