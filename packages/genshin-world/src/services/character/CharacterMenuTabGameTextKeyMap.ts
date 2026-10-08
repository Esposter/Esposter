import { CharacterMenuTab } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// Each of the character screen's tabs by the game's name for it
export const CharacterMenuTabGameTextKeyMap = {
  [CharacterMenuTab.Artifacts]: GameTextKey.CharacterArtifacts,
  [CharacterMenuTab.Attributes]: GameTextKey.CharacterAttributes,
  [CharacterMenuTab.Constellation]: GameTextKey.CharacterConstellation,
  [CharacterMenuTab.Profile]: GameTextKey.CharacterProfile,
  [CharacterMenuTab.Talents]: GameTextKey.CharacterTalents,
  [CharacterMenuTab.Weapons]: GameTextKey.CharacterWeapons,
} as const satisfies Record<CharacterMenuTab, GameTextKey>;
