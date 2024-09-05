import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/scene/monsterParty/MenuOption";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { exhaustiveGuard } from "@esposter/shared";

export const useMenuStore = defineStore("dungeons/monsterParty/menu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterIdToMove, sceneMode } = storeToRefs(monsterPartySceneStore);
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const monsterPartyMenuOptionGrid = useMonsterPartyMenuOptionGrid();
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const infoPanelStore = useInfoPanelStore();
  const { infoDialogMessage } = storeToRefs(infoPanelStore);
  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    // We should never hit the menu mode if the player was selecting "Cancel"
    // @TODO: We should be able to use instanceof Monster
    // if some day in the future we can fully deserialize json data from local storage
    // to proper classes even for nested objects
    if (monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel) return false;
    else if (sceneMode.value === SceneMode.Default)
      if (justDownInput === PlayerSpecialInput.Enter) {
        sceneMode.value = SceneMode.Menu;
        return true;
      } else return false;
    else if (sceneMode.value !== SceneMode.Menu) return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (monsterPartyMenuOptionGrid.value) {
        case MenuOption.Move: {
          monsterIdToMove.value = monsterPartyOptionGrid.value.id;
          sceneMode.value = SceneMode.Move;
          infoDialogMessage.value.text = `Select a monster to switch ${monsterPartyOptionGrid.value.key} with.`;
          break;
        }
        case MenuOption.Summary: {
          const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
          const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
          const { launchScene } = usePreviousScene(scene.scene.key);
          selectedMonster.value = monsterPartyOptionGrid.value;
          launchScene(scene, SceneKey.MonsterDetails);
          break;
        }
        case MenuOption.Release:
          if (player.value.monsters.length <= 1) {
            infoDialogMessage.value.text = "Cannot release any more monsters.";
            sceneMode.value = SceneMode.Default;
            break;
          }

          sceneMode.value = SceneMode.Confirmation;
          infoDialogMessage.value.text = `Release ${monsterPartyOptionGrid.value.key}?`;
          break;
        case MenuOption.Cancel:
          onCancel();
          break;
        default:
          exhaustiveGuard(monsterPartyMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (isMovingDirection(justDownInput)) monsterPartyMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    sceneMode.value = SceneMode.Default;
  };

  return { onPlayerInput };
});
