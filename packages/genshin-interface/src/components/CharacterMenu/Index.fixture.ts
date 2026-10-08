import { CharacterMenuTab } from "#src/models/CharacterMenuTab";

// The Traveler alone, on the Attributes tab, its panel's words in its slot
export const props = {
  characterId: 1,
  characters: [{ id: 1, name: "Traveler" }],
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
export const slot = "Lv. 1/20";
