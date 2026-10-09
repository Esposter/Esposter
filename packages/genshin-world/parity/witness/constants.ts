// A submesh of an exported mesh is its own OBJ group, named after the mesh with its index appended
export const SUBMESH_INDEX_REGEX = /_(?<index>\d+)$/u;
// The foliage shader the game's leaf cards draw with, by the name the witness layout gives it (an unnamed shader's
// Path ID). Its `_Cutoff` clips the card's texture alpha; no other shader in the exports reads it
export const LEAF_SHADER = "Shader #9134712319877186229";
