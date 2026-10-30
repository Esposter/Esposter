// A slot of the team Party Setup shows its member's name and its level as the game words it.
// Its element's mark is given as a path and the colour it is drawn in.
// Every field is empty for an empty slot, and the path and colour are empty too for a member with no element
export interface PartySetupSlot {
  elementColor: string;
  elementMarkPath: string;
  levelText: string;
  name: string;
}
