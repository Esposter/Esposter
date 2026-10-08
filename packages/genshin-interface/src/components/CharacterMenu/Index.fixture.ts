import { CharacterMenuTab } from "#src/models/CharacterMenuTab";

// Xilonen on the Attributes tab, as the English client's character screen shows her at level 90, its panel's words in
// Its slot; the Traveler stands beside her in the list
export const props = {
  characterId: 2,
  characters: [
    { id: 1, name: "Traveler" },
    { id: 2, name: "Xilonen" },
  ],
  tab: CharacterMenuTab.Attributes,
  tabLabels: {
    [CharacterMenuTab.Artifacts]: "Artifacts",
    [CharacterMenuTab.Attributes]: "Attributes",
    [CharacterMenuTab.Constellation]: "Constellation",
    [CharacterMenuTab.Profile]: "Profile",
    [CharacterMenuTab.Talents]: "Talents",
    [CharacterMenuTab.Weapons]: "Weapons",
  },
};
export const slot = "Level 90 / 90";
