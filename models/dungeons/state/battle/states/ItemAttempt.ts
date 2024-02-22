import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useDialogStore } from "@/store/dungeons/dialog";

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const battleDialogTarget = useBattleDialogTarget();

    updateQueuedMessagesAndShowMessage(battleDialogTarget, ["Your bag is empty..."], () =>
      battleStateMachine.setState(StateName.PlayerInput),
    );
  },
};
