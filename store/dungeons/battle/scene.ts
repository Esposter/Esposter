import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Direction } from "grid-engine";

export const useBattleSceneStore = defineStore("dungeons/battle/scene", () => {
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const playerStore = usePlayerStore();
  const { optionGrid, attackOptionGrid } = storeToRefs(playerStore);
  const infoPanelStore = useInfoPanelStore();
  const { showMessage } = infoPanelStore;
  const { isQueuedMessagesAnimationPlaying, isWaitingForPlayerSpecialInput } = storeToRefs(infoPanelStore);
  const activePanel = ref(ActivePanel.Info);

  const onPlayerInput = () => {
    const input = controls.value.input;
    // Check if we're trying to show messages first
    if (input === PlayerSpecialInput.Confirm)
      if (isQueuedMessagesAnimationPlaying.value) return;
      else if (isWaitingForPlayerSpecialInput.value) {
        showMessage();
        return;
      }

    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (activePanel.value === ActivePanel.Option) onChoosePlayerOption();
        else if (activePanel.value === ActivePanel.AttackOption) {
          const playerStore = usePlayerStore();
          const { attackOptionGrid } = storeToRefs(playerStore);
          if (attackOptionGrid.value.value !== BLANK_VALUE) battleStateMachine.setState(StateName.EnemyInput);
        }
        return;
      case PlayerSpecialInput.Cancel:
        activePanel.value = ActivePanel.Option;
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
