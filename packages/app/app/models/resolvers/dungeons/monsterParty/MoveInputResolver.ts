import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export class MoveInputResolver extends AInputResolver {
  override handleInput(_scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsterIdToMove, sceneMode } = storeToRefs(monsterPartySceneStore);
    const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);

    if (sceneMode.value !== SceneMode.Move || !monsterIdToMove.value) return false;

    const onCancel = () => {
      sceneMode.value = SceneMode.Menu;
    };

    if (justDownInput === PlayerSpecialInput.Confirm) {
      if (monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel) {
        onCancel();
        return true;
      } else if (monsterPartyOptionGrid.value.id === monsterIdToMove.value) return true;

      const index = player.value.monsters.findIndex(({ id }) => id === monsterIdToMove.value);
      if (index === -1) throw new InvalidOperationError(Operation.Read, this.handleInput.name, monsterIdToMove.value);

      const infoPanelStore = useInfoPanelStore();
      const { infoDialogMessage } = storeToRefs(infoPanelStore);
      [player.value.monsters[index], player.value.monsters[monsterPartyOptionGrid.index]] = [
        takeOne(player.value.monsters, monsterPartyOptionGrid.index),
        takeOne(player.value.monsters, index),
      ];

      sceneMode.value = SceneMode.Default;
      monsterIdToMove.value = undefined;
      infoDialogMessage.value.text = DEFAULT_INFO_DIALOG_MESSAGE;
    } else if (justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (isMovingDirection(justDownInput)) monsterPartyOptionGrid.move(justDownInput);

    return true;
  }
}
