import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
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
      activeMonsterAnimationStateOnComplete.value = () =>
        updateQueuedMessagesAndShowMessage(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => battleStateMachine.setState(StateName.Finished),
        );
      activeMonsterAnimationState.value = AnimationState.Death;
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
  },
};
