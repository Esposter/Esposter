import type { State } from "#src/models/dungeons/state/State";

import { PlayerOption } from "#src/models/dungeons/scene/battle/menu/PlayerOption";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { getAttackStatePriorityMap } from "#src/services/dungeons/scene/battle/getAttackStatePriorityMap";
import { PlayerBattleMenuOptionGrid } from "#src/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { useActionStore } from "#src/store/dungeons/battle/action";

export const Battle: State<typeof StateName.Battle> = {
  name: StateName.Battle,
  onEnter: async () => {
    // The attack sequence, each step separated by a brief pause:
    // 1. Show attack used
    // 2. Play attack animation
    // 3. Play damage animation
    // 4. Play health bar animation
    // 5. Repeat for the other monster if necessary
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);
    attackStatePriorityMap.value = getAttackStatePriorityMap();

    if (
      PlayerBattleMenuOptionGrid.value === PlayerOption.Fight &&
      attackStatePriorityMap.value[StateName.Battle] === StateName.PlayerAttack
    )
      await battleStateMachine.setState(StateName.PlayerAttack);
    else await battleStateMachine.setState(StateName.EnemyAttack);
  },
};
