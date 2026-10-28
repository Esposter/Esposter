import { LoginPartFamily } from "#src/models/login/LoginPartFamily";

// The user data key a scene marks each object of its own families with, by the family's name, so a witness tool draws
// A family of ours into the same targets as the exports' it stands for
export const SCENE_FAMILY_KEY = "sceneFamily";
// The user data key a copy of the game's door holds its placement within its family under, which followLoginWitnessDoor
// Carries to our door's axes each frame
export const IN_FAMILY_KEY = "inFamily";
// How many samples a texture takes along a grazing line of sight, as the game's own sampler takes them: its recordings
// Show the walkway's joints sharp down to the door, where a sampler taking one reads its texture's coarse levels and
// Blurs them away, so our shade canvases and the witness's textures alike are read so
export const SCENE_TEXTURE_ANISOTROPY = 8;
// A submesh of an exported mesh is its own OBJ group, named after the mesh with its index appended
export const SUBMESH_INDEX_REGEX = /_(?<index>\d+)$/u;
// The foliage shader the game's leaf cards draw with, by the name the witness layout gives it (an unnamed shader's
// Path ID). Its `_Cutoff` clips the card's texture alpha; no other shader in the exports reads it
export const LEAF_SHADER = "Shader #9134712319877186229";
// The layout `genshin:assets witness` writes beside a component's exports, which the parity page's witness and the world
// Under `nuxt dev` both draw them by
export const WITNESS_LAYOUT_FILE_NAME = "witness.json";
// The game's own character model `genshin:assets avatar` writes beside a component's exports: its manifest, and the
// Binary of its meshes' typed arrays the manifest's views lie in
export const AVATAR_MANIFEST_FILE_NAME = "avatar.json";
export const AVATAR_BINARY_FILE_NAME = "avatar.bin";
// The files a component holds at its root, beside its assets, which the exports' server serves by name
export const SCENE_EXPORT_ROOT_FILE_NAMES = [
  WITNESS_LAYOUT_FILE_NAME,
  AVATAR_MANIFEST_FILE_NAME,
  AVATAR_BINARY_FILE_NAME,
];
// The families whose parts a scene moves one by one, so the witness keeps a group per part of each: the login's walkway,
// Whose pieces rise as the camera nears them, and its door, which rises in the pieces its bones carry. Every other
// Family's parts stand still and are drawn as instances
export const MOVING_PART_FAMILIES: ReadonlySet<string> = new Set<string>([
  LoginPartFamily.Door,
  LoginPartFamily.Walkway,
]);
// The moving families whose meshes are skinned rigidly, each part split into a group per piece its bones carry, named by
// The bone, for its scene to carry along the clip the game moves them by: the login's door. The mesh's skin is read from
// The JSON its export writes beside it
export const RIGID_PIECE_FAMILIES: ReadonlySet<string> = new Set<string>([LoginPartFamily.Door]);
// The listing of the components a host serves the exports of, beside their folders
export const SCENE_EXPORT_INDEX_PATH = "index.json";
