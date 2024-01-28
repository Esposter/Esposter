import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/scene/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/scene/battle/infoPanel";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const playerStore = useEnemyStore();
    const {
      activeMonster,
      isActiveMonsterFainted,
      activeMonsterAnimationState,
      activeMonsterAnimationStateOnComplete,
    } = storeToRefs(playerStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    if (isActiveMonsterFainted.value) {
      activeMonsterAnimationStateOnComplete.value = () => {
        updateQueuedMessagesAndShowMessage(
          [`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."],
          () => battleStateMachine.setState(StateName.Finished),
        );
      };
      activeMonsterAnimationState.value = AnimationState.Death;
      return;
    }

    battleStateMachine.setState(StateName.EnemyAttack);
  },
};
