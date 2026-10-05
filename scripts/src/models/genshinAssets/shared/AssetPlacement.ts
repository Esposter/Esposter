// Where one of a scene's objects stands in the world, in the game's own left-handed axes (y up, z forward): its
// Position, its rotation as a quaternion, and its scale, composed through every parent above it
export interface AssetPlacement {
  // The object it hangs from, by its file and transform: a part's levels of detail hang from one LOD group
  father: string;
  // The materials its renderer draws the mesh with, one a submesh, by path ID: they are references into other files,
  // So the asset index names them
  materials: string[];
  // The mesh its filter draws, or empty for an object that draws none
  mesh: string;
  name: string;
  position: [number, number, number];
  // The name of the root it hangs from, which says which of a block's arrangements it belongs to
  root: string;
  rotation: [number, number, number, number];
  scale: [number, number, number];
}
