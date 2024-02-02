import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const playerStore = usePlayerStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(playerStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(false, () =>
        updateQueuedMessagesAndShowMessage(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => battleStateMachine.setState(StateName.Finished),
        ),
      );
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
  },
};
