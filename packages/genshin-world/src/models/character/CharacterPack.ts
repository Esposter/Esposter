// A release read into the pack layout the world draws from, ready to keep: the character it was identified as, the hash
// Of its files, its model's own name, its terms as text, and its files by the path the layout serves each at
export interface CharacterPack {
  characterId: number;
  files: ReadonlyMap<string, Blob>;
  modelName: string;
  packHash: string;
  terms: string;
}
