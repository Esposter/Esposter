import type { InteractionPrompt } from "genshin-interface";
import type { Vector3Like } from "three";

// A thing in the world the character can act on: its prompt, and where it stands in world metres
export interface Interactable extends InteractionPrompt {
  position: Vector3Like;
}
