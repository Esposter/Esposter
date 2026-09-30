import type { SceneWitness } from "#src/models/scene/SceneWitness";
import type { InjectionKey } from "vue";

// The witness a host hands a scene, drawn in place of its own parts: only the parity page's witness render provides it,
// So every stand-in of ours is priced against the game's exports under the scene's own camera, light and frame
export const SceneWitnessKey: InjectionKey<SceneWitness> = Symbol("SceneWitness");
