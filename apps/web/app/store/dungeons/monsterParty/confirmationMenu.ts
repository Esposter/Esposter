import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ConfirmationMenuOption } from "#src/models/dungeons/scene/monsterParty/ConfirmationMenuOption";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "#src/services/dungeons/scene/monsterParty/constants";
import { MonsterPartyConfirmationMenuOptionGrid } from "#src/services/dungeons/scene/monsterParty/MonsterPartyConfirmationMenuOptionGrid";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const useConfirmationMenuStore = defineStore("dungeons/monsterParty/confirmationMenu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();

  const onPlayerInput = (_scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (
      monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel ||
      monsterPartySceneStore.sceneMode !== SceneMode.Confirmation
    )
      return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (MonsterPartyConfirmationMenuOptionGrid.value) {
        case ConfirmationMenuOption.No:
          onCancel();
          break;
        case ConfirmationMenuOption.Yes: {
          const monsterId = monsterPartyOptionGrid.value.id;
          const index = monsterPartySceneStore.monsters.findIndex(({ id }) => id === monsterId);
          if (index === -1) throw new InvalidOperationError(Operation.Read, onPlayerInput.name, monsterId);

          monsterPartySceneStore.monsters = monsterPartySceneStore.monsters.toSpliced(index, 1);
          monsterPartySceneStore.sceneMode = SceneMode.Default;
          monsterPartyInfoPanelStore.infoDialogMessage.text = `You released ${monsterPartyOptionGrid.value.key} into the wild.`;
          break;
        }
        default:
          exhaustiveGuard(MonsterPartyConfirmationMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (checkIsMovingDirection(justDownInput)) MonsterPartyConfirmationMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    monsterPartySceneStore.sceneMode = SceneMode.Menu;
    monsterPartyInfoPanelStore.infoDialogMessage.text = DEFAULT_INFO_DIALOG_MESSAGE;
  };

  return { onPlayerInput };
});
