import type { State } from "@/models/dungeons/state/State";

import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { createCaptureResult } from "@/services/dungeons/item/createCaptureResult";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { prettify } from "@/util/text/prettify";

export const CatchMonster: State<StateName> = {
  name: StateName.CatchMonster,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const captureResult = createCaptureResult(activeMonster.value);
    await useThrowBallAnimation(scene, captureResult);

    if (captureResult === CaptureResult.Success) {
      const monsterPartySceneStore = useMonsterPartySceneStore();
      const { monsters } = storeToRefs(monsterPartySceneStore);
      await useMonsterDeathTween(true);
      await showMessages(scene, [`You caught ${prettify(activeMonster.value.key)}.`]);
      await battleStateMachine.setState(StateName.GainExperience);
      monsters.value.push(activeMonster.value);
      return;
    }

    await showMessages(scene, [`Wild ${prettify(activeMonster.value.key)} breaks free!`]);
    await battleStateMachine.setState(StateName.EnemyInput);
  },
};
