import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

export abstract class AInputResolver {
  handleInput(_scene: SceneWithPlugins, _justDownInput: PlayerInput, _input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
}
