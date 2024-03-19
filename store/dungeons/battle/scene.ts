import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useBattleSceneStore = defineStore("dungeons/battle/scene", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const playerStore = usePlayerStore();
  const { optionGrid, attackOptionGrid } = storeToRefs(playerStore);
  const activePanel = ref(ActivePanel.Info);

  const initialize = () => {
    battleStateMachine.setState(null);
  };

  const onPlayerInput = (input: PlayerInput) => {
    if (handleShowMessageInput(input)) return;
    else if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (activePanel.value === ActivePanel.Option) onChoosePlayerOption();
        else if (activePanel.value === ActivePanel.AttackOption) {
          const playerStore = usePlayerStore();
          const { attackOptionGrid } = storeToRefs(playerStore);
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

  return { activePanel, initialize, onPlayerInput };
});
