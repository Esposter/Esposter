import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    showMessages(["You got away safely!"], () => {
      battleStateMachine.setState(StateName.Finished);
    });
  },
};
