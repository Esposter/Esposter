import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Grid } from "#src/models/dungeons/Grid";
import { ConfirmationMenuOption } from "#src/models/dungeons/scene/monsterParty/ConfirmationMenuOption";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "#src/services/dungeons/scene/monsterParty/constants";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const useConfirmationMenuStore = defineStore("dungeons/monsterParty/confirmationMenu", () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = monsterPartySceneStore;
  const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const monsterPartyConfirmationMenuOptionGrid = markRaw(
    new Grid({ grid: [[ConfirmationMenuOption.Yes], [ConfirmationMenuOption.No]] as const }),
  );

  const onPlayerInput = (_scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (
      monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel ||
      monsterPartySceneStore.sceneMode !== SceneMode.Confirmation
    )
      return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (monsterPartyConfirmationMenuOptionGrid.value) {
        case ConfirmationMenuOption.No:
          onCancel();
          break;
        case ConfirmationMenuOption.Yes: {
          const monsterId = monsterPartyOptionGrid.value.id;
          const index = monsterPartySceneStore.monsters.findIndex(({ id }) => id === monsterId);
          if (index === -1) throw new InvalidOperationError(Operation.Read, onPlayerInput.name, monsterId);

          monsterPartySceneStore.monsters = monsterPartySceneStore.monsters.toSpliced(index, 1);
          monsterPartySceneStore.sceneMode = SceneMode.Default;
          monsterPartyInfoPanelStore.infoDialogMessage.text = `You released ${monsterPartyOptionGrid.value.key} into the wild.`;
          break;
        }
        default:
          exhaustiveGuard(monsterPartyConfirmationMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel) onCancel();
    else if (checkIsMovingDirection(justDownInput)) monsterPartyConfirmationMenuOptionGrid.move(justDownInput);

    return true;
  };

  const onCancel = () => {
    monsterPartySceneStore.sceneMode = SceneMode.Menu;
    monsterPartyInfoPanelStore.infoDialogMessage.text = DEFAULT_INFO_DIALOG_MESSAGE;
  };

  return { monsterPartyConfirmationMenuOptionGrid, onPlayerInput };
});
