import type { Object3D } from "three";
import type { Ref } from "vue";

// What the parity page's witness render hands a scene: the game's exports laid out as the scene's parts, drawn in
// Place of its own, and whether the scene draws them alone, without its own fog, clouds and cloud sea, so a camera
// Pose is matched on the exports' edges without ours (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export interface SceneWitness {
  isAlone: Ref<boolean>;
  parts: Object3D;
}
