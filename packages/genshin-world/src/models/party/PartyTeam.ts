// A team set up in Party Setup: its members' character ids, filled from the left as the game fills them, and the name
// The player gave it, "" while it keeps the game's own (Party 1 to 4 for the four every player starts with)
export interface PartyTeam {
  characterIds: number[];
  name: string;
}
