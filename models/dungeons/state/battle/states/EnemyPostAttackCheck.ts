import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const playerStore = usePlayerStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(playerStore);
    const battleDialogTarget = useBattleDialogTarget();

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(false, () =>
        updateQueuedMessagesAndShowMessage(
          battleDialogTarget,
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => battleStateMachine.setState(StateName.Finished),
        ),
      );
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
  },
};
