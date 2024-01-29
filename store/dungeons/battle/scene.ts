import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Direction } from "grid-engine";
import { type Types } from "phaser";

export const useBattleSceneStore = defineStore("dungeons/battle/scene", () => {
  const playerStore = usePlayerStore();
  const { optionGrid, attackOptionGrid } = storeToRefs(playerStore);
  const infoPanelStore = useInfoPanelStore();
  const { updateQueuedMessagesAndShowMessage, showMessage } = infoPanelStore;
  const { isQueuedMessagesAnimationPlaying, isWaitingForPlayerSpecialInput } = storeToRefs(infoPanelStore);

  // We will make sure to initialise cursor keys on scene create function
  const cursorKeys = ref() as Ref<Types.Input.Keyboard.CursorKeys>;
  const activePanel = ref(ActivePanel.Info);

  const onPlayerInput = (input: PlayerSpecialInput | Direction) => {
    // These are all the states that use updateAndShowMessage
    const playerConfirmShowNextMessageStates: (StateName | null)[] = [
      StateName.PreBattleInfo,
      StateName.PlayerInput,
      StateName.PlayerPostAttackCheck,
      StateName.EnemyPostAttackCheck,
      StateName.FleeAttempt,
    ];

    if (!playerConfirmShowNextMessageStates.includes(battleStateMachine.currentStateName)) return;
    // Check if we're trying to show messages
    if (input === PlayerSpecialInput.Confirm)
      if (isQueuedMessagesAnimationPlaying.value) return;
      else if (isWaitingForPlayerSpecialInput.value) {
        showMessage();
        return;
      }
    // From here on we only have the player input state to handle
    if (battleStateMachine.currentStateName !== StateName.PlayerInput) return;

    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (activePanel.value === ActivePanel.Option) onChoosePlayerOption();
        else if (activePanel.value === ActivePanel.AttackOption) battleStateMachine.setState(StateName.EnemyInput);
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
        activePanel.value = ActivePanel.Info;
        updateQueuedMessagesAndShowMessage(["You have no other monsters in your party..."], () => {
          activePanel.value = ActivePanel.Option;
        });
        return;
      case PlayerOption.Item:
        activePanel.value = ActivePanel.Info;
        updateQueuedMessagesAndShowMessage(["Your bag is empty..."], () => {
          activePanel.value = ActivePanel.Option;
        });
        return;
      case PlayerOption.Flee:
        battleStateMachine.setState(StateName.FleeAttempt);
        return;
      default:
        exhaustiveGuard(optionGrid.value.value);
    }
  };

  return { cursorKeys, activePanel, onPlayerInput };
});
