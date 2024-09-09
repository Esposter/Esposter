import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { prettifyName } from "@/util/text/prettifyName";

export const CatchMonster: State<StateName> = {
  name: StateName.CatchMonster,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const isCaptureSuccessful = true;
    await useThrowBallAnimation(isCaptureSuccessful);

    if (isCaptureSuccessful) {
      await useMonsterDeathTween(true);
      await showMessages(scene, [`You caught ${prettifyName(activeMonster.value.key)}.`]);
      await battleStateMachine.setState(StateName.GainExperience);
      return;
    }

    await showMessages(scene, [`Wild ${prettifyName(activeMonster.value.key)} breaks free!`]);
    await battleStateMachine.setState(StateName.EnemyInput);
  },
};
