import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const useMonsterPartyInputStore = defineStore("dungeons/monsterParty/input", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const infoPanelStore = useInfoPanelStore();
  const battlePlayerStore = useBattlePlayerStore();
  const { launchScene, previousSceneKey, switchToPreviousScene } = usePreviousScene(SceneKey.MonsterParty);

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (monsterPartySceneStore.sceneMode !== SceneMode.Default || (await handleShowMessageInput(scene, justDownInput)))
      return;
    else if (isPlayerSpecialInput(justDownInput)) await onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = async (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        onCancel(scene);
        return;
      case PlayerSpecialInput.Confirm:
        await onPlayerConfirmInput(scene, monsterPartyOptionGrid.value);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerConfirmInput = async (scene: SceneWithPlugins, value: typeof monsterPartyOptionGrid.value) => {
    if (value === PlayerSpecialInput.Cancel) {
      onCancel(scene);
      return;
    }

    switch (previousSceneKey.value) {
      case SceneKey.Battle:
        if (isMonsterFainted(value)) {
          infoPanelStore.infoDialogMessage.text = "Selected monster is fainted.";
          return;
        } else if (battlePlayerStore.activeMonster.id === value.id) {
          infoPanelStore.infoDialogMessage.text = "Selected monster is already battling.";
          return;
        }
        switchToPreviousScene(scene);
        phaserEventEmitter.emit("switchMonster", value);
        return;
      case SceneKey.Inventory: {
        const itemOptionGrid = useItemOptionGrid();
        if (itemOptionGrid.value === PlayerSpecialInput.Cancel)
          throw new InvalidOperationError(Operation.Update, onPlayerConfirmInput.name, itemOptionGrid.value);
        await useItem(scene, toRef(itemOptionGrid.value), toRef(value));
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
    monsterPartyOptionGrid.move(direction);
  };

  const onCancel = (scene: SceneWithPlugins) => {
    if (previousSceneKey.value === SceneKey.Battle && isMonsterFainted(battlePlayerStore.activeMonster)) {
      infoPanelStore.infoDialogMessage.text = "You need to select a monster to switch to.";
      return;
    }

    switchToPreviousScene(scene);
    phaserEventEmitter.emit("unswitchMonster");
  };

  return {
    onPlayerInput,
  };
});
