import type { State } from "#src/models/dungeons/state/State";

import { CaptureResult } from "#src/models/dungeons/item/CaptureResult";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { createCaptureResult } from "#src/services/dungeons/item/createCaptureResult";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { prettify } from "#src/util/text/prettify";

export const CatchMonster: State<typeof StateName.CatchMonster> = {
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
      // The caught monster joins the party before the battle's experience is shared out, so it takes its share
      monsters.value.push(activeMonster.value);
      await battleStateMachine.setState(StateName.GainExperience);
    } else {
      const monsterName = prettify(activeMonster.value.key);
      // A near miss says how close it was before the monster breaks free
      const nearMissMessages = captureResult === CaptureResult.NearMiss ? [`You almost caught ${monsterName}!`] : [];
      await showMessages(scene, [...nearMissMessages, `Wild ${monsterName} breaks free!`]);
      await battleStateMachine.setState(StateName.EnemyInput);
    }
  },
};
