// A mesh's bounds in metres: the lowest and the highest of its vertices on each of the game's axes, x, y and z
export interface MeshBounds {
  maximum: [number, number, number];
  minimum: [number, number, number];
}
