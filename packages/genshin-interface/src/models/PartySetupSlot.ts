// A slot of the team Party Setup shows: its member's name, its level as the game words it, its element's mark's path and
// the colour that mark is drawn in, all of them empty for an empty slot, the path and colour too for a member with no element
export interface PartySetupSlot {
  elementColor: string;
  elementMarkPath: string;
  levelText: string;
  name: string;
}
