import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { prettify } from "#src/util/text/prettify";
import { getSynchronizedFunction } from "@esposter/shared";

export const PreBattleInfo: State<typeof StateName.PreBattleInfo> = {
  name: StateName.PreBattleInfo,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);

    await useMonsterAppearTween(true);
    // The info container slides in while the message shows, so the messages do not wait on it
    getSynchronizedFunction(() => useMonsterInfoContainerAppearTween(true))();
    await showMessages(scene, [`A wild ${prettify(activeMonster.value.key)} has appeared!`]);
    await battleStateMachine.setState(StateName.BringOutMonster);
  },
};
