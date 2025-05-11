import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";

export class MovementInteractionInputResolver extends AInputResolver {
  override async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput, input: PlayerInput) {
    const worldPlayerStore = useWorldPlayerStore();
    const { isMoving } = storeToRefs(worldPlayerStore);

    useMoveNpcs(scene);

    if (isMoving.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      await useInteractions(scene);
      return true;
    } else if (isMovingDirection(input)) {
      scene.gridEngine.move(CharacterId.Player, input);
      return true;
    }

    return false;
  }
}
