import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useDialogStore } from "@/store/dungeons/dialog";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const battleDialogTarget = useBattleDialogTarget();

    updateQueuedMessagesAndShowMessage(battleDialogTarget, ["You got away safely!"], () => {
      battleStateMachine.setState(StateName.Finished);
    });
  },
};
