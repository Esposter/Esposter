import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { isMovingDirection } from "@/services/dungeons/input/isMovingDirection";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";

export class MovementInteractionInputResolver extends AInputResolver {
  handleInput(justDownInput: PlayerInput, input: PlayerInput, scene: SceneWithPlugins) {
    const playerStore = useWorldPlayerStore();
    const { isMoving } = storeToRefs(playerStore);

    useMoveNpcList(scene);

    if (isMoving.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      useInteractions();
      return true;
    } else if (isMovingDirection(input)) {
      scene.gridEngine.move(CharacterId.Player, input);
      return true;
    }

    return false;
  }
}
