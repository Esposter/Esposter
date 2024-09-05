import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";

import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { PlayerBattleMenuOptionGrid } from "@/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useExperienceBarStore } from "@/store/dungeons/UI/experienceBar";
import { exhaustiveGuard } from "@esposter/shared";

export const useBattleSceneStore = defineStore("dungeons/battle/scene", () => {
  const dialogStore = useDialogStore();
  const { handleShowMessageInput } = dialogStore;
  const attackOptionGrid = useAttackOptionGrid();
  const activePanel = ref(ActivePanel.Info);
  const experienceBarStore = useExperienceBarStore();
  const { isAnimating, isSkipAnimations } = storeToRefs(experienceBarStore);

  const onPlayerInput = async (scene: SceneWithPlugins, input: PlayerInput) => {
    if (await handleShowMessageInput(scene, input)) return;
    else if (isPlayerSpecialInput(input)) await onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = async (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        activePanel.value = ActivePanel.Option;
        return;
      case PlayerSpecialInput.Confirm:
        if (isAnimating.value) {
          isSkipAnimations.value = true;
          isAnimating.value = false;
        } else if (activePanel.value === ActivePanel.Option) await onSelectPlayerOption();
        else if (activePanel.value === ActivePanel.AttackOption) {
          const attackOptionGrid = useAttackOptionGrid();
          if (attackOptionGrid.value) await battleStateMachine.setState(StateName.EnemyInput);
        }
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    if (activePanel.value === ActivePanel.Option) PlayerBattleMenuOptionGrid.move(direction);
    else if (activePanel.value === ActivePanel.AttackOption) attackOptionGrid.move(direction);
  };

  const onSelectPlayerOption = async () => {
    switch (PlayerBattleMenuOptionGrid.value) {
      case PlayerOption.Fight:
        activePanel.value = ActivePanel.AttackOption;
        return;
      case PlayerOption.Switch:
        await battleStateMachine.setState(StateName.SwitchAttempt);
        return;
      case PlayerOption.Item:
        await battleStateMachine.setState(StateName.ItemAttempt);
        return;
      case PlayerOption.Flee:
        await battleStateMachine.setState(StateName.FleeAttempt);
        return;
      default:
        exhaustiveGuard(PlayerBattleMenuOptionGrid.value);
    }
  };

  return { activePanel, onPlayerInput };
});
