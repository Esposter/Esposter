import type { Artifact } from "#src/models/artifact/Artifact";
import type { Weapon } from "#src/models/weapon/Weapon";

// A character the player has, by its data's id: how far it has grown, its level and its ascension phase, the weapon it
// Wields, and the artifacts it wears, one a piece
export interface Character {
  artifacts: Artifact[];
  ascension: number;
  id: number;
  level: number;
  weapon: Weapon;
}
