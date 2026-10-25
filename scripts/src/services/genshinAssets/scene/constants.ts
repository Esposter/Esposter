// The code a scene script's JSON depends on, whose commits its producer stamp lists
export const SCENE_SCRIPT_PRODUCER_PATHS: string[] = [
  "scripts/src/models/recreation/lua",
  "scripts/src/services/recreation/lua",
  "scripts/src/services/genshinAssets/lua",
  "scripts/src/services/genshinAssets/scene/exportSceneScript.ts",
];

// A float nearer zero than this, or farther than the largest, is some other field's bits; a colour's channel may be
// Brighter than one where it is lit, never by more than this
export const MIN_MAGNITUDE = 1e-5;
