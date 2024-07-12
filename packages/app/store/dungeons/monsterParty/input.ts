import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard } from "@esposter/shared";
import type { Direction } from "grid-engine";

export const useMonsterPartyInputStore = defineStore("dungeons/monsterParty/input", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const battlePlayerStore = useBattlePlayerStore();
  const { activeMonster: battleActiveMonster } = storeToRefs(battlePlayerStore);
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const {
    optionGrid,
    activeMonsterIndex: monsterPartyActiveMonsterIndex,
    activeMonster: monsterPartyActiveMonster,
  } = storeToRefs(monsterPartySceneStore);
  const itemStore = useItemStore();
  const { selectedItemIndex, selectedItem } = storeToRefs(itemStore);
  const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
  const { monsterIndex } = storeToRefs(monsterDetailsSceneStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.MonsterParty);

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (await handleShowMessageInput(scene, justDownInput)) return;
    else if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (optionGrid.value.value === PlayerSpecialInput.Cancel) switchToPreviousScene(scene);
        else if (selectedItemIndex.value > -1) {
          monsterPartyActiveMonsterIndex.value = optionGrid.value.index;
          useItem(scene, selectedItem, monsterPartyActiveMonster);
          selectedItemIndex.value = -1;
        } else if (monsterPartyActiveMonsterIndex.value > -1) {
          battleActiveMonster.value = monsterPartyActiveMonster.value;
          monsterPartyActiveMonsterIndex.value = -1;
          switchToPreviousScene(scene);
        } else {
          monsterIndex.value = optionGrid.value.index;
          launchScene(scene, SceneKey.MonsterDetails);
        }
        return;
      case PlayerSpecialInput.Cancel:
        switchToPreviousScene(scene);
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
