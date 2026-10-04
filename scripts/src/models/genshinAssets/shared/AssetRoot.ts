// A root a component is exported from: the block holding it, its game object's name, and that game object's path ID,
// Which names it where its name is shared
export interface AssetRoot {
  block: string;
  name: string;
  pathId: string;
}
