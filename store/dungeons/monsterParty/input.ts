import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useInputStore = defineStore("dungeons/monsterParty/input", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { optionGrid, activeMonsterIndex, activeMonster } = storeToRefs(monsterPartySceneStore);
  const itemStore = useItemStore();
  const { selectedItemIndex, selectedItem } = storeToRefs(itemStore);
  const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
  const { monsterIndex } = storeToRefs(monsterDetailsSceneStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.MonsterParty);

  const onPlayerInput = (justDownInput: PlayerInput, scene: SceneWithPlugins) => {
    if (handleShowMessageInput(justDownInput, scene)) return;
    else if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (optionGrid.value.value === PlayerSpecialInput.Cancel) switchToPreviousScene();
        else if (selectedItemIndex.value === -1) {
          monsterIndex.value = optionGrid.value.index;
          launchScene(SceneKey.MonsterDetails);
        } else {
          activeMonsterIndex.value = optionGrid.value.index;
          useItem(selectedItem, activeMonster, SceneKey.MonsterParty);
        }
        return;
      case PlayerSpecialInput.Cancel:
        switchToPreviousScene();
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return {
    onPlayerInput,
  };
});
