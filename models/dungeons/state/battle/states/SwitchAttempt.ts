import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useDialogStore } from "@/store/dungeons/dialog";

export const SwitchAttempt: State<StateName> = {
  name: StateName.SwitchAttempt,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const battleDialogTarget = useBattleDialogTarget();

    updateQueuedMessagesAndShowMessage(battleDialogTarget, ["You have no other monsters in your party..."], () =>
      battleStateMachine.setState(StateName.PlayerInput),
    );
  },
};
