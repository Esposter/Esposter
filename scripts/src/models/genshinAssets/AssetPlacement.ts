// Where one of a scene's objects stands in the world, in the game's own left-handed axes (y up, z forward): its
// Position, its rotation as a quaternion, and its scale, composed through every parent above it
export interface AssetPlacement {
  // The mesh its filter draws, or empty for an object that draws none
  mesh: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}
