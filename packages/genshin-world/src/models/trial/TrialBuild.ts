// The build a trial character is fought with: the weapon it holds, its refinement and its constellation, each read from the
// Wiki's level-90 build of the character
export interface TrialBuild {
  characterId: number;
  constellation: number;
  refinement: number;
  weaponId: number;
}
