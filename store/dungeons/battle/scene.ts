import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";
import { exhaustiveGuard } from "@/util/validation/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useBattleSceneStore = defineStore("dungeons/battle/scene", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const battlePlayerStore = useBattlePlayerStore();
  const { optionGrid, attackOptionGrid } = storeToRefs(battlePlayerStore);
  const activePanel = ref(ActivePanel.Info);

  const onPlayerInput = (scene: SceneWithPlugins, input: PlayerInput) => {
    if (handleShowMessageInput(scene, input)) return;
    else if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (activePanel.value === ActivePanel.Option) onChoosePlayerOption();
        else if (activePanel.value === ActivePanel.AttackOption) {
          const battlePlayerStore = useBattlePlayerStore();
          const { attackOptionGrid } = storeToRefs(battlePlayerStore);
          if (attackOptionGrid.value.value) battleStateMachine.setState(StateName.EnemyInput);
        }
        return;
      case PlayerSpecialInput.Cancel:
        activePanel.value = ActivePanel.Option;
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    if (activePanel.value === ActivePanel.Option) optionGrid.value.move(direction);
    else if (activePanel.value === ActivePanel.AttackOption) attackOptionGrid.value.move(direction);
  };

  const onChoosePlayerOption = () => {
    switch (optionGrid.value.value) {
      case PlayerOption.Fight:
        activePanel.value = ActivePanel.AttackOption;
        return;
      case PlayerOption.Switch:
        battleStateMachine.setState(StateName.SwitchAttempt);
        return;
      case PlayerOption.Item:
        battleStateMachine.setState(StateName.ItemAttempt);
        return;
      case PlayerOption.Flee:
        battleStateMachine.setState(StateName.FleeAttempt);
        return;
      default:
        exhaustiveGuard(optionGrid.value.value);
    }
  };

  return { activePanel, onPlayerInput };
});
