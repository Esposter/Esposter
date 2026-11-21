import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { CharacterId } from "#src/models/dungeons/scene/world/CharacterId";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";
import { interact } from "#src/services/dungeons/scene/world/interaction/interact";
import { moveNpcs } from "#src/services/dungeons/scene/world/moveNpcs";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useWorldPlayerStore } from "#src/store/dungeons/world/player";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { noop } from "@esposter/shared";

export class MovementInteractionInputResolver extends AInputResolver {
  override async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput, input: PlayerInput) {
    const worldPlayerStore = useWorldPlayerStore();
    const { isMoving } = storeToRefs(worldPlayerStore);
    const worldSceneStore = useWorldSceneStore();
    const { gridEngine } = storeToRefs(worldSceneStore);
    const worldGridEngine = gridEngine.value;
    // Until the tilemap has its engine there is no player placed on it, which answers the same as a player not placed
    if (!worldGridEngine) return true;

    moveNpcs(worldGridEngine);

    if (isMoving.value || !worldGridEngine.checkHasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      await interact(scene);
      return true;
    } else if (checkIsMovingDirection(input)) {
      worldGridEngine.move(CharacterId.Player, input).match(noop, console.error);
      return true;
    }

    return false;
  }
}
