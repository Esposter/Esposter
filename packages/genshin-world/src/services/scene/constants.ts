// The user data key a scene marks each object of its own families with, by the family's name, so a witness tool draws
// A family of ours into the same targets as the exports' it stands for
export const SCENE_FAMILY_KEY = "sceneFamily";
// How many samples a texture takes along a grazing line of sight, as the game's own sampler takes them: its recordings
// Show the walkway's joints sharp down to the door, where a sampler taking one reads its texture's coarse levels and
// Blurs them away, so our shade canvases and the witness's textures alike are read so
export const SCENE_TEXTURE_ANISOTROPY = 8;
// A submesh of an exported mesh is its own OBJ group, named after the mesh with its index appended
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const SUBMESH_INDEX_REGEX: RegExp = /_(?<index>\d+)$/u;
// The foliage shader the game's leaf cards draw with, by the name the witness layout gives it (an unnamed shader's
// Path ID). Its `_Cutoff` clips the card's texture alpha; no other shader in the exports reads it
export const LEAF_SHADER = "Shader #9134712319877186229";
// The layout `genshin:assets witness` writes beside a component's exports, which the parity page's witness and the world
// Under `nuxt dev` both draw them by
export const WITNESS_LAYOUT_FILE_NAME = "witness.json";
// The listing of the components a host serves the exports of, beside their folders
export const SCENE_EXPORT_INDEX_PATH = "index.json";
