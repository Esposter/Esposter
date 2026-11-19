// The fields read off one row of the game's monster table: the monster's id and the feature tag group it names, which
// Holds the tags its fish's bait draws on. A fish's group is named by its monster, which need not share its id
export interface ExcelMonsterRow {
  featureTagGroupID: number;
  id: number;
}
