import type { State } from "@/models/dungeons/state/State";

import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { generateCaptureResult } from "@/services/dungeons/item/generateCaptureResult";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { prettifyName } from "@/util/text/prettifyName";

export const CatchMonster: State<StateName> = {
  name: StateName.CatchMonster,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const captureResult = generateCaptureResult(activeMonster.value);
    await useThrowBallAnimation(scene, captureResult);

    if (captureResult === CaptureResult.Success) {
      const monsterPartySceneStore = useMonsterPartySceneStore();
      const { monsters } = storeToRefs(monsterPartySceneStore);
      await useMonsterDeathTween(true);
      await showMessages(scene, [`You caught ${prettifyName(activeMonster.value.key)}.`]);
      await battleStateMachine.setState(StateName.GainExperience);
      monsters.value.push(activeMonster.value);
      return;
    }

    await showMessages(scene, [`Wild ${prettifyName(activeMonster.value.key)} breaks free!`]);
    await battleStateMachine.setState(StateName.EnemyInput);
  },
};
