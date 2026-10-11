import type { DumpedSceneNpcBorn } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBorn";

// The scene's NPC births file as the dump holds it, one file a scene, each record in the order of its birth ids
export interface DumpedSceneNpcBornFile {
  bornPosList: DumpedSceneNpcBorn[];
  sceneId: number;
}
