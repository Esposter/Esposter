import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";

export const PreBattleInfo: State<StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);

    await useMonsterAppearTween(true, async () => {
      useMonsterInfoContainerAppearTween(true);
      await showMessages(scene, [`A wild ${activeMonster.value.key} has appeared!`], async () => {
        await battleStateMachine.setState(StateName.BringOutMonster);
      });
    });
  },
};
