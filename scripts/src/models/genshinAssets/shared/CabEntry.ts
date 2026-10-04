// One serialized file (a CAB) of the game's blocks as AnimeStudio's CAB map lists it: the block holding it, relative
// To the blocks folder, and the CABs it depends on, lowercase, in the order of its own table of external references
export interface CabEntry {
  block: string;
  dependencies: string[];
}
