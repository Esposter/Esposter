// A game string a search matched: its text id, and the hash its text is filed under.
// Its name is the manual text map's name for it, where that file names it.
// Its key is the GameTextKey member that takes it.
// Its values are its text in each language asked for, keyed by tag.
export interface GameTextMatch {
  id: string;
  key?: string;
  name?: string;
  values: Record<string, string>;
}
