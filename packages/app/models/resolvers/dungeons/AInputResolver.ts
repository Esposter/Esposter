import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
// @TODO: Add GetAll{Scene}InputResolvers once es decorators gets implemented
export abstract class AInputResolver {
  // This is named "handleInputPre" instead of "handlePreInput"
  // because we're still handling the input and won't proceed to call "handleInput"
  // if "handleInputPre" successfully handles the input first
  handleInputPre(
    _scene: SceneWithPlugins,
    _justDownInput: PlayerInput,
    _input: PlayerInput,
  ): boolean | Promise<boolean> {
    return false;
  }

  handleInput(_scene: SceneWithPlugins, _justDownInput: PlayerInput, _input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
}