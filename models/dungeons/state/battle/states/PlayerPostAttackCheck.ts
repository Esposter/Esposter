import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const enemyStore = useEnemyStore();
    const {
      activeMonster,
      isActiveMonsterFainted,
      activeMonsterAnimationState,
      activeMonsterAnimationStateOnComplete,
    } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    if (isActiveMonsterFainted.value) {
      activeMonsterAnimationStateOnComplete.value = () => {
        activePanel.value = ActivePanel.Info;
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
