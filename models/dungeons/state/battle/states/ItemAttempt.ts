import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    showMessages(["Your bag is empty..."], () => {
      battleStateMachine.setState(StateName.PlayerInput);
    });
  },
};
