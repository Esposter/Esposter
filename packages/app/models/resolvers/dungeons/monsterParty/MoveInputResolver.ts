import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { InvalidOperationError, Operation } from "@esposter/shared";

export class MoveInputResolver extends AInputResolver {
  handleInput(_scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsterIdToMove, monsterPartyOptionGrid, sceneMode } = storeToRefs(monsterPartySceneStore);
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);

    if (sceneMode.value !== SceneMode.Move || !monsterIdToMove.value) return false;

    const onCancel = () => {
      sceneMode.value = SceneMode.Menu;
    };

    if (justDownInput === PlayerSpecialInput.Confirm) {
      if (monsterPartyOptionGrid.value.value === PlayerSpecialInput.Cancel) {
        onCancel();
        return true;
      }

      const index = player.value.monsters.findIndex(({ id }) => id === monsterIdToMove.value);
      if (index === -1) throw new InvalidOperationError(Operation.Read, this.handleInput.name, monsterIdToMove.value);

      const infoPanelStore = useInfoPanelStore();
      const { infoDialogMessage } = storeToRefs(infoPanelStore);
      [player.value.monsters[index], player.value.monsters[monsterPartyOptionGrid.value.index]] = [
        player.value.monsters[monsterPartyOptionGrid.value.index],
        player.value.monsters[index],
      ];

      infoDialogMessage.value.text = DEFAULT_INFO_DIALOG_MESSAGE;
      sceneMode.value = SceneMode.Default;
      monsterIdToMove.value = undefined;
    } else if (justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (isMovingDirection(justDownInput)) monsterPartyOptionGrid.value.move(justDownInput);

    return true;
  }
}
