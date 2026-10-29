// A slot of the team Party Setup shows: its member's name, its level as the game words it and its element's mark's path,
// all of them empty for an empty slot, the path too for a member with no element
export interface PartySetupSlot {
  elementMarkPath: string;
  levelText: string;
  name: string;
}
