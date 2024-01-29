import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";

export const SwitchAttempt: State<StateName> = {
  name: StateName.SwitchAttempt,
  onEnter: () => {
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    updateQueuedMessagesAndShowMessage(["You have no other monsters in your party..."], () =>
      battleStateMachine.setState(StateName.PlayerInput),
    );
  },
};
