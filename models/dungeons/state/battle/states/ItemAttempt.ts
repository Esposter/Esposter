import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: () => {
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    updateQueuedMessagesAndShowMessage(["Your bag is empty..."], () =>
      battleStateMachine.setState(StateName.PlayerInput),
    );
  },
};
