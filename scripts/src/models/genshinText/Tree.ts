import type { TreeEntry } from "#src/models/genshinText/TreeEntry";

// A directory's tree from the GitHub Git Trees API: its entries, and whether the API cut them short
export interface Tree {
  tree: TreeEntry[];
  truncated: boolean;
}
