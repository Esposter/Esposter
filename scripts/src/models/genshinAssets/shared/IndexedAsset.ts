// One asset of the game's blocks as the asset index lists it: its name, its type, the block holding it relative to the
// Blocks folder, its path ID as source text, and the offset in that block of the serialized file (the CAB) holding it,
// By which the CAB map names that file
export interface IndexedAsset {
  block: string;
  name: string;
  offset: number;
  pathId: string;
  type: string;
}
