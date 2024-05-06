import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";

export const SwitchAttempt: State<StateName> = {
  name: StateName.SwitchAttempt,
  onEnter: (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    showMessages(scene, ["You have no other monsters in your party..."], () => {
      battleStateMachine.setState(StateName.PlayerInput);
    });
  },
};
