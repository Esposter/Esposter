import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { ConfirmationMenuOption } from "@/models/dungeons/scene/monsterParty/ConfirmationMenuOption";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { MonsterPartyConfirmationMenuOptionGrid } from "@/services/dungeons/scene/monsterParty/MonsterPartyConfirmationMenuOptionGrid";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const useConfirmationMenuStore = defineStore("dungeons/monsterParty/confirmationMenu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { sceneMode } = storeToRefs(monsterPartySceneStore);
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const infoPanelStore = useInfoPanelStore();
  const { infoDialogMessage } = storeToRefs(infoPanelStore);

  const onPlayerInput = (_scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    // We should never hit the menu mode if the player was selecting "Cancel"
    // @TODO: We should be able to use instanceof Monster
    // if some day in the future we can fully deserialize json data from local storage
    // to proper classes even for nested objects
    if (monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel) return false;
    else if (sceneMode.value !== SceneMode.Confirmation) return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (MonsterPartyConfirmationMenuOptionGrid.value) {
        case ConfirmationMenuOption.Yes: {
          const monsterId = monsterPartyOptionGrid.value.id;
          const index = player.value.monsters.findIndex(({ id }) => id === monsterId);
          if (index === -1) throw new InvalidOperationError(Operation.Read, onPlayerInput.name, monsterId);

          player.value.monsters.splice(index, 1);
          sceneMode.value = SceneMode.Default;
          infoDialogMessage.value.text = `You released ${monsterPartyOptionGrid.value.key} into the wild.`;
          break;
        }
        case ConfirmationMenuOption.No: {
          onCancel();
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
    sceneMode.value = SceneMode.Menu;
    infoDialogMessage.value.text = DEFAULT_INFO_DIALOG_MESSAGE;
  };

  return { onPlayerInput };
});
