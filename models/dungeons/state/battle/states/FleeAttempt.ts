import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const actionStore = useActionStore();
    const { isFleeAttempted } = storeToRefs(actionStore);

    isFleeAttempted.value = true;

    if (Math.random() < 0.5) {
      showMessages(["You failed to run away..."], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
      return;
    }

    showMessages(["You got away safely!"], () => {
      battleStateMachine.setState(StateName.Finished);
    });
  },
};
