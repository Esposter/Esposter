// One trial character's build on the wiki's Character Trial pages: the weapon it holds at level 90, its refinement and its
// Constellation, cited to the page it is read from
export interface WikiTrialBuild {
  characterId: number;
  characterName: string;
  constellation: number;
  page: string;
  refinement: number;
  weaponId: number;
  weaponName: string;
}
