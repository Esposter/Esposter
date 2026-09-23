// A block of voxels, x fastest then y then z, each holding its colour's index in `PaletteColors` plus one, and 0 where
// It is empty
export interface VoxelGrid {
  depth: number;
  height: number;
  voxels: Uint8Array;
  width: number;
}
