import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    updateQueuedMessagesAndShowMessage(["You got away safely!"], () => battleStateMachine.setState(StateName.Finished));
  },
};
