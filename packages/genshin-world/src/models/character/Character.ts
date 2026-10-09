import type { Artifact } from "#src/models/artifact/Artifact";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Weapon } from "#src/models/weapon/Weapon";

// A character the player has, by its data's id: how far it has grown, its level and its ascension phase, the level each
// Of its combat talents is at, the weapon it wields, and the artifacts it wears, one a piece. Its constellations it has
// Activated, in order, and the Stella Fortuna it holds to activate the next, which only its own duplicates bring. Its
// Companionship EXP in total, from which its Friendship Level is read
export interface Character {
  artifacts: Artifact[];
  ascension: number;
  constellationCount: number;
  friendshipExp: number;
  id: number;
  level: number;
  stellaFortunaCount: number;
  talentLevels: TalentLevels;
  weapon: Weapon;
}
