import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

export const SwitchAttempt: State<StateName> = {
  name: StateName.SwitchAttempt,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    activePanel.value = ActivePanel.Info;
    updateQueuedMessagesAndShowMessage(["You have no other monsters in your party..."], () =>
      battleStateMachine.setState(StateName.PlayerInput),
    );
  },
};
