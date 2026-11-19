import type { State } from "#src/models/dungeons/state/State";

import { useEnemyActiveMonster } from "#src/composables/dungeons/scene/battle/monster/useEnemyActiveMonster";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { animateMonsterAppear } from "#src/services/dungeons/scene/battle/monster/animateMonsterAppear";
import { animateMonsterInfoContainerAppear } from "#src/services/dungeons/scene/battle/monster/animateMonsterInfoContainerAppear";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { prettify } from "#src/util/text/prettify";
import { getSynchronizedFunction } from "@esposter/shared";

export const PreBattleInfo: State<typeof StateName.PreBattleInfo> = {
  name: StateName.PreBattleInfo,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const activeMonster = useEnemyActiveMonster(StateName.PreBattleInfo);
    await animateMonsterAppear(true);
    // The info container slides in while the message shows, so the messages do not wait on it
    getSynchronizedFunction(() => animateMonsterInfoContainerAppear(true))();
    await showMessages(scene, [`A wild ${prettify(activeMonster.value.key)} has appeared!`]);
    await battleStateMachine.setState(StateName.BringOutMonster);
  },
};
