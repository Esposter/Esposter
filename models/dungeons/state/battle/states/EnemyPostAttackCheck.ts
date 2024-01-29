import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const playerStore = usePlayerStore();
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
        activePanel.value = ActivePanel.Info;
        updateQueuedMessagesAndShowMessage(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => battleStateMachine.setState(StateName.Finished),
        );
      };
      activeMonsterAnimationState.value = AnimationState.Death;
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
  },
};
