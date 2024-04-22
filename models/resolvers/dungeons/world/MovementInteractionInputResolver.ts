import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export class MovementInteractionInputResolver extends AInputResolver {
  handleInput(justDownInput: PlayerInput, input: PlayerInput, scene: SceneWithPlugins) {
    const worldSceneStore = useWorldSceneStore();
    const { encounterLayer } = storeToRefs(worldSceneStore);
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    const worldPlayerStore = useWorldPlayerStore();
    const { isMoving } = storeToRefs(worldPlayerStore);

    useMoveNpcList(scene);

    if (isMoving.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return true;
    else if (justDownInput === PlayerSpecialInput.Confirm) {
      useInteractions();
      return true;
    } else if (isMovingDirection(input)) {
      scene.gridEngine.move(CharacterId.Player, input);
      if (encounterLayer.value.getTileAt(player.value.position.x, player.value.position.y)) {
        const { play } = useDungeonsSoundEffect(SoundEffectKey.StepGrass);
        play();
      }
      return true;
    }

    return false;
  }
}
