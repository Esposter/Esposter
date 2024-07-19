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
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { optionGrid } = storeToRefs(monsterPartySceneStore);
  const { previousSceneKey, launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.MonsterParty);

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (await handleShowMessageInput(scene, justDownInput)) return;
    else if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        onPlayerConfirmInput(scene, optionGrid.value.value);
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

  const onPlayerConfirmInput = (scene: SceneWithPlugins, value: typeof optionGrid.value.value) => {
    if (value === PlayerSpecialInput.Cancel) {
      switchToPreviousScene(scene);
      return;
    }

    switch (previousSceneKey.value) {
      case SceneKey.Battle: {
        const battlePlayerStore = useBattlePlayerStore();
        const { activeMonster } = storeToRefs(battlePlayerStore);
        activeMonster.value = value;
        switchToPreviousScene(scene);
        return;
      }
      case SceneKey.Inventory: {
        const itemStore = useItemStore();
        const { selectedItem } = storeToRefs(itemStore);
        useItem(scene, selectedItem, toRef(value));
        return;
      }
      default: {
        const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
        const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
        selectedMonster.value = value;
        launchScene(scene, SceneKey.MonsterDetails);
        return;
      }
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return {
    onPlayerInput,
  };
});
