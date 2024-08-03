import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export abstract class AInputResolver {
  handleInput(_scene: SceneWithPlugins, _justDownInput: PlayerInput, _input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
}
