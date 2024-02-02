import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";

export const PreBattleInfo: State<StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: () => {
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    useMonsterAppearTween(true, () => {
      useMonsterInfoContainerAppearTween(true);
      updateQueuedMessagesAndShowMessage([`Wild ${activeMonster.value.name} appeared!`], () =>
        battleStateMachine.setState(StateName.BringOutMonster),
      );
    });
  },
};
