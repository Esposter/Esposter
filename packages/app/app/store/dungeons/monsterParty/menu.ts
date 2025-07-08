import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/scene/monsterParty/MenuOption";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard } from "@esposter/shared";

export const useMenuStore = defineStore("dungeons/monsterParty/menu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
  const monsterPartyMenuOptionGrid = useMonsterPartyMenuOptionGrid();
  const infoPanelStore = useInfoPanelStore();
  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel) return false;
    else if (monsterPartySceneStore.sceneMode === SceneMode.Default)
      if (justDownInput === PlayerSpecialInput.Enter) {
        monsterPartySceneStore.sceneMode = SceneMode.Menu;
        return true;
      } else return false;
    else if (monsterPartySceneStore.sceneMode !== SceneMode.Menu) return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (monsterPartyMenuOptionGrid.value) {
        case MenuOption.Cancel:
          onCancel();
          break;
        case MenuOption.Move:
          monsterPartySceneStore.monsterIdToMove = monsterPartyOptionGrid.value.id;
          monsterPartySceneStore.sceneMode = SceneMode.Move;
          infoPanelStore.infoDialogMessage.text = `Select a monster to switch ${monsterPartyOptionGrid.value.key} with.`;
          break;
        case MenuOption.Release:
          if (monsterPartySceneStore.monsters.length <= 1) {
            infoPanelStore.infoDialogMessage.text = "Cannot release any more monsters.";
            monsterPartySceneStore.sceneMode = SceneMode.Default;
            break;
          }

          monsterPartySceneStore.sceneMode = SceneMode.Confirmation;
          infoPanelStore.infoDialogMessage.text = `Release ${monsterPartyOptionGrid.value.key}?`;
          break;
        case MenuOption.Summary: {
          const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
          const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
          const { launchScene } = usePreviousScene(scene.scene.key);
          selectedMonster.value = monsterPartyOptionGrid.value;
          launchScene(scene, SceneKey.MonsterDetails);
          break;
        }
        default:
          exhaustiveGuard(monsterPartyMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (isMovingDirection(justDownInput)) monsterPartyMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    monsterPartySceneStore.sceneMode = SceneMode.Default;
  };

  return { onPlayerInput };
});
