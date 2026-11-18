import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

// A component's layout as its blocks: the blocks its layout dumps are held in, the CAB map, the names of the dumped
// Files (each a CAB) and the name of every game object and component the dumps hold, by file and path ID
export interface ComponentLayoutBlocks {
  blocks: Set<string>;
  cabMap: Map<string, CabEntry>;
  layoutFiles: Set<string>;
  objectNameMap: Map<string, string>;
}
