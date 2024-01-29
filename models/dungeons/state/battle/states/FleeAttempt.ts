import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    activePanel.value = ActivePanel.Info;
    updateQueuedMessagesAndShowMessage(["You got away safely!"], () => battleStateMachine.setState(StateName.Finished));
  },
  onExit: () => {
    const infoPanelStore = useInfoPanelStore();
    const { line1Text } = storeToRefs(infoPanelStore);
    line1Text.value = "";
  },
};
