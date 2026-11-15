import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { CharacterId } from "#src/models/dungeons/scene/world/CharacterId";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useWorldPlayerStore } from "#src/store/dungeons/world/player";

export class MovementInteractionInputResolver extends AInputResolver {
  override async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput, input: PlayerInput) {
    const worldPlayerStore = useWorldPlayerStore();
    const { isMoving } = storeToRefs(worldPlayerStore);

    useMoveNpcs(scene);

    if (isMoving.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      await useInteractions(scene);
      return true;
    } else if (checkIsMovingDirection(input)) {
      scene.gridEngine.move(CharacterId.Player, input);
      return true;
    }

    return false;
  }
}
