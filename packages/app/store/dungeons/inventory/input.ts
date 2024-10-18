import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { exhaustiveGuard } from "@esposter/shared";

export const useInventoryInputStore = defineStore("dungeons/inventory/input", () => {
  const itemOptionGrid = useItemOptionGrid();
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.Inventory);

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        onCancel(scene);
        return;
      case PlayerSpecialInput.Confirm:
        if (itemOptionGrid.value === PlayerSpecialInput.Cancel) onCancel(scene);
        else
          switch (itemOptionGrid.value.effect.type) {
            // We assume that you can only call capture items in the battle scene (which is the previous scene)
            case ItemEffectType.Capture: {
              const enemyStore = useEnemyStore();
              const { activeMonster } = storeToRefs(enemyStore);
              useItem(scene, toRef(itemOptionGrid.value), activeMonster);
              break;
            }
            case ItemEffectType.Heal:
              launchScene(scene, SceneKey.MonsterParty);
              break;
            default:
              exhaustiveGuard(itemOptionGrid.value.effect.type);
          }
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    itemOptionGrid.move(direction);
  };

  const onCancel = (scene: SceneWithPlugins) => {
    switchToPreviousScene(scene);
    phaserEventEmitter.emit("unuseItem");
  };

  return {
    onPlayerInput,
  };
});
