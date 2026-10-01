import type { Object3D } from "three";
import type { Ref } from "vue";

// What the parity page's witness render hands a scene: the game's exports laid out as the scene's parts, and the
// Families of them it draws in place of the scene's own, which the scene leaves out of its own drawing, so each of its
// Families is priced against the exports by handing it back. Alone, the scene draws neither its fog, its clouds nor
// Its cloud sea, so a camera pose is matched on the exports' edges without ours. While a tool holds its clock, the
// Scene's time stands still, so one view drawn twice draws the same frame
// (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export interface SceneWitness {
  families: Ref<string[]>;
  isAlone: Ref<boolean>;
  isClockHeld: Ref<boolean>;
  parts: Object3D;
}
