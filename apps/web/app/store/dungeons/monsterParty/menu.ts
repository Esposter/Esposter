import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Grid } from "#src/models/dungeons/Grid";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { MenuOption } from "#src/models/dungeons/scene/monsterParty/MenuOption";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { transitionFrom } from "#src/services/dungeons/scene/transitionFrom";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useMonsterDetailsSceneStore } from "#src/store/dungeons/monsterDetails/scene";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "#src/store/dungeons/player";
import { exhaustiveGuard } from "@esposter/shared";

export const useMonsterPartyMenuStore = defineStore("dungeons/monsterParty/menu", () => {
  const playerStore = usePlayerStore();
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = monsterPartySceneStore;
  const { previousSceneKey } = transitionFrom(SceneKey.MonsterParty);
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const monsterPartyMenuOptionGrid = markRaw(
    new Grid<MenuOption[][]>({
      grid: computed(() => {
        switch (previousSceneKey.value) {
          case SceneKey.Battle:
            return [[MenuOption.Summary], [MenuOption.Cancel]];
          case SceneKey.Inventory:
            return playerStore.player.monsters.length > 1
              ? [[MenuOption.Move], [MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]]
              : [[MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]];
          default:
            return playerStore.player.monsters.length > 1
              ? [[MenuOption.Move], [MenuOption.Release], [MenuOption.Cancel]]
              : [[MenuOption.Release], [MenuOption.Cancel]];
        }
      }),
      isWrapping: true,
    }),
  );
  const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
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
          monsterPartyInfoPanelStore.infoDialogMessage.text = `Select a monster to switch ${monsterPartyOptionGrid.value.key} with.`;
          break;
        case MenuOption.Release:
          if (monsterPartySceneStore.monsters.length <= 1) {
            monsterPartyInfoPanelStore.infoDialogMessage.text = "Cannot release any more monsters.";
            monsterPartySceneStore.sceneMode = SceneMode.Default;
            break;
          }

          monsterPartySceneStore.sceneMode = SceneMode.Confirmation;
          monsterPartyInfoPanelStore.infoDialogMessage.text = `Release ${monsterPartyOptionGrid.value.key}?`;
          break;
        case MenuOption.Summary: {
          const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
          const { launchScene } = transitionFrom(scene.scene.key);
          monsterDetailsSceneStore.selectedMonster = monsterPartyOptionGrid.value;
          launchScene(scene, SceneKey.MonsterDetails);
          break;
        }
        default:
          exhaustiveGuard(monsterPartyMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (checkIsMovingDirection(justDownInput)) monsterPartyMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    monsterPartySceneStore.sceneMode = SceneMode.Default;
  };

  return { monsterPartyMenuOptionGrid, onPlayerInput };
});
