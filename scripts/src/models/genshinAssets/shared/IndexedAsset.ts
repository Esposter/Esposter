// One asset of the game's blocks as the asset index lists it: its name, its type, the block holding it relative to the
// Blocks folder, and its path ID as source text
export interface IndexedAsset {
  block: string;
  name: string;
  pathId: string;
  type: string;
}
