import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/scene/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/scene/battle/infoPanel";

export const PreBattleInfo: State<StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: () => {
    const enemyStore = useEnemyStore();
    const {
      activeMonster,
      activeMonsterAnimationState,
      activeMonsterAnimationStateOnComplete,
      isPlayingHealthBarAppearAnimation,
    } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    activeMonsterAnimationStateOnComplete.value = () => {
      isPlayingHealthBarAppearAnimation.value = true;
      updateQueuedMessagesAndShowMessage([`Wild ${activeMonster.value.name} appeared!`], () =>
        battleStateMachine.setState(StateName.BringOutMonster),
      );
    };
    activeMonsterAnimationState.value = AnimationState.Appear;
  },
  onExit: () => {
    const infoPanelStore = useInfoPanelStore();
    const { line1Text } = storeToRefs(infoPanelStore);
    line1Text.value = "";
  },
};
