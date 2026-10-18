import type { Element } from "#src/models/Element";

// A slot of a team as Party Setup shows it: its member's name, level and element. A slot the team leaves empty has none
// Of them, so its level is zero, its name blank and its element none
export interface PartyTeamSlot {
  element?: Element;
  level: number;
  name: string;
}
