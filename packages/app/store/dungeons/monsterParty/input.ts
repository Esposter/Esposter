import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";
import type { Direction } from "grid-engine";

export const useMonsterPartyInputStore = defineStore("dungeons/monsterParty/input", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = storeToRefs(monsterPartySceneStore);
  const infoPanelStore = useInfoPanelStore();
  const { infoDialogMessage } = storeToRefs(infoPanelStore);
  const battlePlayerStore = useBattlePlayerStore();
  const { activeMonster } = storeToRefs(battlePlayerStore);
  const { previousSceneKey, launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.MonsterParty);

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (await handleShowMessageInput(scene, justDownInput)) return;
    else if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        onPlayerConfirmInput(scene, monsterPartyOptionGrid.value.value);
        return;
      case PlayerSpecialInput.Cancel:
        onCancel(scene);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerConfirmInput = (scene: SceneWithPlugins, value: typeof monsterPartyOptionGrid.value.value) => {
    if (value === PlayerSpecialInput.Cancel) {
      onCancel(scene);
      return;
    }

    switch (previousSceneKey.value) {
      case SceneKey.Battle:
        if (isMonsterFainted(value)) {
          infoDialogMessage.value.text = "Selected monster is fainted.";
          return;
        } else if (activeMonster.value.id === value.id) {
          infoDialogMessage.value.text = "Selected monster is already battling.";
          return;
        }
        switchToPreviousScene(scene);
        phaserEventEmitter.emit("switchMonster", value);
        return;
      case SceneKey.Inventory: {
        const itemStore = useInventorySceneStore();
        const { itemOptionGrid } = storeToRefs(itemStore);
        if (itemOptionGrid.value.value === PlayerSpecialInput.Cancel)
          throw new InvalidOperationError(Operation.Update, onPlayerConfirmInput.name, itemOptionGrid.value.value);
        useItem(scene, toRef(itemOptionGrid.value.value), toRef(value));
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
    monsterPartyOptionGrid.value.move(direction);
  };

  const onCancel = (scene: SceneWithPlugins) => {
    if (previousSceneKey.value === SceneKey.Battle && isMonsterFainted(activeMonster.value)) {
      infoDialogMessage.value.text = "You need to select a monster to switch to.";
      return;
    }

    switchToPreviousScene(scene);
    phaserEventEmitter.emit("unswitchMonster");
  };

  return {
    onPlayerInput,
  };
});
