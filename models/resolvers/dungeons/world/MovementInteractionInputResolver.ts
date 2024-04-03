import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { isMovingDirection } from "@/services/dungeons/input/isMovingDirection";
import { usePlayerStore } from "@/store/dungeons/world/player";

export class MovementInteractionInputResolver extends AInputResolver {
  handleInput(justDownInput: PlayerInput, input: PlayerInput) {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const playerStore = usePlayerStore();
    const { isMoving } = storeToRefs(playerStore);

    useMoveNpcList();

    if (isMoving.value || !scene.value.gridEngine.hasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      useInteractions();
      return true;
    } else if (isMovingDirection(input)) {
      scene.value.gridEngine.move(CharacterId.Player, input);
      return true;
    }

    return false;
  }
}
