import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useDialogStore } from "@/store/dungeons/dialog";

export const PreBattleInfo: State<StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const battleDialogTarget = useBattleDialogTarget();

    useMonsterAppearTween(true, () => {
      useMonsterInfoContainerAppearTween(true);
      updateQueuedMessagesAndShowMessage(
        battleDialogTarget,
        [`A wild ${activeMonster.value.name} has appeared!`],
        () => {
          battleStateMachine.setState(StateName.BringOutMonster);
        },
      );
    });
  },
};
