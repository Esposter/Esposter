// The character screen's tabs
export enum CharacterMenuTab {
  Artifacts = "Artifacts",
  Attributes = "Attributes",
  Constellation = "Constellation",
  Profile = "Profile",
  Talents = "Talents",
  Weapons = "Weapons",
}

// In the order the game lists them down the screen's right. It is written out, since lint sorts an enum's members and
// The enum's own order is alphabetical
export const CharacterMenuTabs: readonly CharacterMenuTab[] = [
  CharacterMenuTab.Attributes,
  CharacterMenuTab.Weapons,
  CharacterMenuTab.Artifacts,
  CharacterMenuTab.Constellation,
  CharacterMenuTab.Talents,
  CharacterMenuTab.Profile,
];
