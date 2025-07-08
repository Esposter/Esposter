import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ConfirmationMenuOption } from "@/models/dungeons/scene/monsterParty/ConfirmationMenuOption";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { MonsterPartyConfirmationMenuOptionGrid } from "@/services/dungeons/scene/monsterParty/MonsterPartyConfirmationMenuOptionGrid";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const useConfirmationMenuStore = defineStore("dungeons/monsterParty/confirmationMenu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const infoPanelStore = useInfoPanelStore();

  const onPlayerInput = (_scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel) return false;
    else if (monsterPartySceneStore.sceneMode !== SceneMode.Confirmation) return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (MonsterPartyConfirmationMenuOptionGrid.value) {
        case ConfirmationMenuOption.No:
          onCancel();
          break;
        case ConfirmationMenuOption.Yes: {
          const monsterId = monsterPartyOptionGrid.value.id;
          const index = monsterPartySceneStore.monsters.findIndex(({ id }) => id === monsterId);
          if (index === -1) throw new InvalidOperationError(Operation.Read, onPlayerInput.name, monsterId);

          monsterPartySceneStore.monsters.splice(index, 1);
          monsterPartySceneStore.sceneMode = SceneMode.Default;
          infoPanelStore.infoDialogMessage.text = `You released ${monsterPartyOptionGrid.value.key} into the wild.`;
          break;
        }
        default:
          exhaustiveGuard(MonsterPartyConfirmationMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (isMovingDirection(justDownInput)) MonsterPartyConfirmationMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    monsterPartySceneStore.sceneMode = SceneMode.Menu;
    infoPanelStore.infoDialogMessage.text = DEFAULT_INFO_DIALOG_MESSAGE;
  };

  return { onPlayerInput };
});
