// One serialized file (a CAB) as AnimeStudio's CAB map writes it: its name as the file is named, the block holding it
// Relative to the map's base folder, its offset in that block, and the names of the CABs it depends on, in the order of
// Its own table of external references
export interface CabMapRecord {
  block: string;
  dependencies: string[];
  name: string;
  offset: number;
}
