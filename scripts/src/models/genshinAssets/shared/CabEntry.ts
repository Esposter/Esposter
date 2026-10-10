// One serialized file (a CAB) of the game's blocks as AnimeStudio's CAB map lists it: the block holding it, relative
// To the blocks folder, its offset in that block, which the asset index gives each asset's file by, and the CABs it
// Depends on, lowercase, in the order of its own table of external references
export interface CabEntry {
  block: string;
  dependencies: string[];
  offset: number;
}
