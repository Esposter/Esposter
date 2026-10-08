import type { Artifact } from "#src/models/artifact/Artifact";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Weapon } from "#src/models/weapon/Weapon";

// A character the player has, by its data's id: how far it has grown, its level and its ascension phase, the level each
// Of its combat talents is at, the weapon it wields, and the artifacts it wears, one a piece
export interface Character {
  artifacts: Artifact[];
  ascension: number;
  id: number;
  level: number;
  talentLevels: TalentLevels;
  weapon: Weapon;
}
