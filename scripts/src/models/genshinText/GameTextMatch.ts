// A game string a search matched: its text id, the hash its text is filed under, the manual text map's name for it where
// that file names it, the GameTextKey member that takes it, and its text in each language asked for, keyed by tag
export interface GameTextMatch {
  id: string;
  key?: string;
  name?: string;
  values: Record<string, string>;
}
