// A rock object's mesh, of the families `Area_<code>_Rock_` and `Area_<code>_Stone_`: a rock or a boulder.
const ROCK_MESH_REGEX = /^Area_[A-Za-z]+_(?:Rock|Stone)_/u;
// What the families also name and is not a rock: the wall and road of a built area, a lamp in a stone's shape, and the
// Shadow-casting copy the witness lays beside each rock's own mesh
const NON_ROCK_MESH_REGEX = /RockWall|RockRoad|Stonelamp|ShadowMesh/u;

export const checkIsRockMesh = (mesh: string): boolean => ROCK_MESH_REGEX.test(mesh) && !NON_ROCK_MESH_REGEX.test(mesh);
